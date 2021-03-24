import * as parse from 'csv-parse/lib/sync';
import * as ethUtil from 'ethereumjs-util';
import * as abi from 'ethereumjs-abi';
import { ethers } from 'ethers';
import { In, LessThan, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ethereum, general } from '@taraxa-claim/config';
import { CollectionResponse, QueryDto } from '@taraxa-claim/common';
import { BlockchainService, ContractTypes } from '@taraxa-claim/blockchain';
import { BatchEntity, BatchTypes } from './entity/batch.entity';
import { RewardEntity } from './entity/reward.entity';
import { AccountEntity } from './entity/account.entity';
import { AccountClaimEntity } from './entity/account-claim.entity';
import { ClaimEntity } from './entity/claim.entity';
import { FileDto } from './dto/file.dto';
import { CreateBatchDto } from './dto/create-batch.dto';

@Injectable()
export class ClaimService {
  privateKey: Buffer;
  constructor(
    @InjectRepository(BatchEntity)
    private readonly batchRepository: Repository<BatchEntity>,
    @InjectRepository(RewardEntity)
    private readonly rewardRepository: Repository<RewardEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(ClaimEntity)
    private readonly claimRepository: Repository<ClaimEntity>,
    @Inject(general.KEY)
    private readonly generalConfig: ConfigType<typeof general>,
    @Inject(ethereum.KEY)
    private readonly ethereumConfig: ConfigType<typeof ethereum>,
    private readonly blockchainService: BlockchainService,
  ) {
    this.privateKey = Buffer.from(this.ethereumConfig.privateSigningKey, 'hex');
  }
  public async createBatch(
    file: FileDto,
    batchDto: CreateBatchDto,
  ): Promise<RewardEntity[]> {
    const batch = new BatchEntity();
    batch.type = BatchTypes[batchDto.type];
    batch.name = batchDto.name;

    const rewards = await this.updateAccounts(this.parseCsv(file.buffer));
    batch.rewards = rewards;

    await this.batchRepository.save(batch);
    return batch.rewards;
  }
  public async batch(id: number): Promise<BatchEntity> {
    return this.batchRepository.findOneOrFail({ id });
  }
  public async deleteBatch(id: number): Promise<BatchEntity> {
    const batch = await this.batchRepository.findOneOrFail({ id });
    return this.batchRepository.remove(batch);
  }
  public async batches(
    query: QueryDto,
  ): Promise<CollectionResponse<BatchEntity>> {
    const { range, sort, filter } = query;
    const batches = new CollectionResponse<BatchEntity>();
    [batches.data, batches.count] = await this.batchRepository.findAndCount({
      where: filter,
      order: { [sort[0]]: sort[1] },
      skip: range[0],
      take: range[1] - range[0] + 1,
    });
    return batches;
  }
  public async reward(id: number): Promise<RewardEntity> {
    return this.rewardRepository.findOneOrFail({ id });
  }
  public async deleteReward(id: number): Promise<RewardEntity> {
    const reward = await this.rewardRepository.findOneOrFail({ id });
    return this.rewardRepository.remove(reward);
  }
  public async rewards(
    query: QueryDto,
  ): Promise<CollectionResponse<RewardEntity>> {
    const { range, sort, filter } = query;
    const rewards = new CollectionResponse<RewardEntity>();
    [rewards.data, rewards.count] = await this.rewardRepository.findAndCount({
      where: filter,
      order: { [sort[0]]: sort[1] },
      skip: range[0],
      take: range[1] - range[0] + 1,
      relations: ['batch', 'account'],
    });
    rewards.data = rewards.data.map((reward: RewardEntity) => ({
      ...reward,
      numberOfTokens: this.bNStringToString(reward.numberOfTokens),
    }));
    return rewards;
  }
  public async accounts(
    query: QueryDto,
  ): Promise<CollectionResponse<AccountEntity>> {
    const { range, sort, filter } = query;
    let filterNoBatch = { ...filter };

    if (filter.batch) {
      delete filterNoBatch.batch;
      const addresses = (
        await this.rewardRepository.find({
          select: ['address'],
          where: { batch: { id: filter.batch } },
        })
      )
        .map(reward => reward.address)
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        });

      filterNoBatch = { ...filterNoBatch, address: In(addresses) };
    }

    const accounts = new CollectionResponse<AccountEntity>();
    [accounts.data, accounts.count] = await this.accountRepository.findAndCount(
      {
        where: filter.batch ? filterNoBatch : filter,
        order: { [sort[0]]: sort[1] },
        skip: range[0],
        take: range[1] - range[0] + 1,
      },
    );
    accounts.data = accounts.data.map((account: AccountEntity) => ({
      ...account,
      availableToBeClaimed: this.bNStringToString(account.availableToBeClaimed),
      totalLocked: this.bNStringToString(account.totalLocked),
      totalClaimed: this.bNStringToString(account.totalClaimed),
    }));
    return accounts;
  }
  public async account(address: string): Promise<Partial<AccountEntity>> {
    const claim = await this.claimRepository.findOne({
      where: { address, claimed: false },
    });
    if (claim) {
      const nonce = claim.id * 13;

      const claimContractInstance = this.blockchainService.getContractInstance(
        ContractTypes.CLAIM,
        this.ethereumConfig.claimContractAddress,
      );

      const confirmation = await claimContractInstance.getClaimedAmount(
        address,
        claim.numberOfTokens,
        nonce,
      );

      if (
        confirmation.gt(ethers.BigNumber.from('0')) &&
        confirmation.eq(ethers.BigNumber.from(claim.numberOfTokens))
      ) {
        await this.markAsClaimed(claim.id);
      }
    }

    const account = JSON.parse(
      JSON.stringify(await this.accountRepository.findOneOrFail({ address })),
    );
    delete account.id;
    return account;
  }
  public async createClaim(
    address: string,
  ): Promise<Partial<AccountClaimEntity>> {
    let claim = await this.claimRepository.findOne({
      where: { address, claimed: false },
    });

    if (!claim) {
      const {
        availableToBeClaimed,
      } = await this.accountRepository.findOneOrFail({ address });

      if (
        ethers.BigNumber.from(availableToBeClaimed).lte(
          ethers.BigNumber.from(0),
        )
      ) {
        throw new Error('No tokens to claim');
      }

      claim = new ClaimEntity();
      claim.address = address;
      claim.numberOfTokens = availableToBeClaimed;

      await this.claimRepository.save(claim);
    }

    const nonce = claim.id * 13;
    const encodedPayload = abi.soliditySHA3(
      ['address', 'uint', 'uint'],
      [address, claim.numberOfTokens, nonce],
    );

    const { v, r, s } = ethUtil.ecsign(encodedPayload, this.privateKey);
    const hash = ethUtil.toRpcSig(v, r, s);

    return {
      nonce,
      hash,
      availableToBeClaimed: claim.numberOfTokens,
    };
  }
  public async claim(id: number): Promise<ClaimEntity> {
    return this.claimRepository.findOneOrFail({ id });
  }
  public async markAsClaimed(id: number): Promise<void | ClaimEntity> {
    const claim = await this.claimRepository.findOne({
      where: { id, claimed: false },
    });

    if (!claim) {
      return;
    }

    claim.claimed = true;
    claim.claimedAt = new Date();

    const account = await this.accountRepository.findOneOrFail({
      address: claim.address,
    });
    account.availableToBeClaimed = ethers.BigNumber.from(
      account.availableToBeClaimed,
    )
      .sub(claim.numberOfTokens)
      .toString();
    account.totalClaimed = ethers.BigNumber.from(account.totalClaimed)
      .add(claim.numberOfTokens)
      .toString();

    await this.accountRepository.save(account);
    return await this.claimRepository.save(claim);
  }
  public async deleteClaim(id: number): Promise<ClaimEntity> {
    const claim = await this.claimRepository.findOneOrFail({ id });
    return this.claimRepository.remove(claim);
  }
  public async claims(
    query: QueryDto,
  ): Promise<CollectionResponse<ClaimEntity>> {
    const { range, sort, filter } = query;
    const claims = new CollectionResponse<ClaimEntity>();
    [claims.data, claims.count] = await this.claimRepository.findAndCount({
      where: filter,
      order: { [sort[0]]: sort[1] },
      skip: range[0],
      take: range[1] - range[0] + 1,
    });
    claims.data = claims.data.map((claim: ClaimEntity) => ({
      ...claim,
      numberOfTokens: this.bNStringToString(claim.numberOfTokens),
    }));
    return claims;
  }
  public async unlockRewards(): Promise<void> {
    const now = new Date();
    const rewards = await this.rewardRepository.find({
      where: { isUnlocked: false, unlockDate: LessThan(now) },
      relations: ['account'],
    });

    for (const reward of rewards) {
      reward.isUnlocked = true;
      reward.account.availableToBeClaimed = ethers.BigNumber.from(
        reward.account.availableToBeClaimed,
      )
        .add(reward.numberOfTokens)
        .toString();
      reward.account.totalLocked = ethers.BigNumber.from(
        reward.account.totalLocked,
      )
        .sub(reward.numberOfTokens)
        .toString();

      await this.rewardRepository.save(reward);
      await this.accountRepository.save(reward.account);
    }
  }
  private async updateAccounts(
    rewards: RewardEntity[],
  ): Promise<RewardEntity[]> {
    const nRewards = [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    for (const reward of rewards) {
      const { address, unlockDate, numberOfTokens } = reward;
      let account = await this.accountRepository.findOne({
        address,
      });
      const availableToBeClaimed =
        unlockDate <= now ? numberOfTokens : ethers.BigNumber.from(0);
      const totalLocked =
        unlockDate > now ? numberOfTokens : ethers.BigNumber.from(0);
      if (account) {
        account.availableToBeClaimed = ethers.BigNumber.from(
          account.availableToBeClaimed,
        )
          .add(availableToBeClaimed)
          .toString();
        account.totalLocked = ethers.BigNumber.from(account.totalLocked)
          .add(totalLocked)
          .toString();
      } else {
        account = new AccountEntity();
        account.address = address;
        account.availableToBeClaimed = availableToBeClaimed.toString();
        account.totalLocked = totalLocked.toString();
      }
      await this.accountRepository.save(account);
      reward.account = account;
      nRewards.push(reward);
    }
    return nRewards;
  }
  private parseCsv(buffer: Buffer) {
    let rewards: string[][];
    for (const delimiter of [';', ',']) {
      rewards = parse(buffer, {
        delimiter,
        cast: false,
        castDate: false,
        trim: true,
        skipEmptyLines: true,
        skipLinesWithEmptyValues: true,
        skipLinesWithError: true,
      }).map((line: string[]) => {
        return line.filter((l: string) => {
          return l !== '';
        });
      });
      rewards = rewards.filter((line: string[]) => line.length === 3);
      rewards = rewards.filter((line: string[], index: number) => index !== 0);
      if (rewards.length > 0) {
        break;
      }
    }

    if (rewards.length === 0) {
      throw new Error('No valid rewards in the CSV file');
    }

    const now = new Date();
    return rewards.map((line: string[]) => {
      const reward = new RewardEntity();
      reward.address = line[0].toString();
      reward.numberOfTokens = this.stringToBNString(line[1]);
      reward.unlockDate = new Date(line[2]);
      reward.isUnlocked = reward.unlockDate < now;
      return reward;
    });
  }

  private stringToBNString(f: string): string {
    const precision = this.generalConfig.precision;
    const numberOfTokens = ethers.BigNumber.from(
      parseFloat(f.replace('.', '').replace(',', '.')) *
        ethers.BigNumber.from(10)
          .pow(precision)
          .toNumber(),
    )
      .mul(ethers.BigNumber.from(10).pow(18 - precision))
      .toString();

    return numberOfTokens;
  }

  private bNStringToString(i: string): string {
    const precision = this.generalConfig.precision;
    const numberOfTokens =
      ethers.BigNumber.from(i)
        .div(ethers.BigNumber.from(10).pow(18 - precision))
        .toNumber() /
      ethers.BigNumber.from(10)
        .pow(precision)
        .toNumber();

    return numberOfTokens.toString();
  }
}
