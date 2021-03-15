import * as parse from 'csv-parse/lib/sync';
import * as ethUtil from 'ethereumjs-util';
import * as abi from 'ethereumjs-abi';
import { LessThan, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ethereum } from '@taraxa-claim/config';
import { CollectionResponse } from '@taraxa-claim/common';
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
    @Inject(ethereum.KEY)
    private readonly ethereumConfig: ConfigType<typeof ethereum>,
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
    range: number[],
    sort: string[],
  ): Promise<CollectionResponse<BatchEntity>> {
    const batches = new CollectionResponse<BatchEntity>();
    [batches.data, batches.count] = await this.batchRepository.findAndCount({
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
    range: number[],
    sort: string[],
  ): Promise<CollectionResponse<RewardEntity>> {
    const rewards = new CollectionResponse<RewardEntity>();
    [rewards.data, rewards.count] = await this.rewardRepository.findAndCount({
      order: { [sort[0]]: sort[1] },
      skip: range[0],
      take: range[1] - range[0] + 1,
      relations: ['batch'],
    });
    return rewards;
  }
  public async accounts(
    range: number[],
    sort: string[],
  ): Promise<CollectionResponse<AccountEntity>> {
    const accounts = new CollectionResponse<AccountEntity>();
    [accounts.data, accounts.count] = await this.accountRepository.findAndCount(
      {
        order: { [sort[0]]: sort[1] },
        skip: range[0],
        take: range[1] - range[0] + 1,
      },
    );
    return accounts;
  }
  public async account(address: string): Promise<Partial<AccountEntity>> {
    const account = JSON.parse(
      JSON.stringify(await this.accountRepository.findOneOrFail({ address })),
    );
    delete account.id;
    const claim = await this.claimRepository.findOne({
      where: { address, claimed: false },
    });
    if (!claim) {
      return account;
    }
    const lastClaim = {
      nonce: claim.id * 13,
      numberOfTokens: claim.numberOfTokens,
    };
    return {
      ...account,
      lastClaim,
    };
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

      if (availableToBeClaimed <= 0) {
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
  public async markAsClaimed(id: number): Promise<ClaimEntity> {
    const claim = await this.claimRepository.findOneOrFail({ id });
    claim.claimed = true;

    const account = await this.accountRepository.findOneOrFail({
      address: claim.address,
    });
    account.availableToBeClaimed -= claim.numberOfTokens;
    account.totalClaimed += claim.numberOfTokens;

    await this.accountRepository.save(account);

    return await this.claimRepository.save(claim);
  }
  public async deleteClaim(id: number): Promise<ClaimEntity> {
    const claim = await this.claimRepository.findOneOrFail({ id });
    return this.claimRepository.remove(claim);
  }
  public async claims(
    range: number[],
    sort: string[],
  ): Promise<CollectionResponse<ClaimEntity>> {
    const claims = new CollectionResponse<ClaimEntity>();
    [claims.data, claims.count] = await this.claimRepository.findAndCount({
      order: { [sort[0]]: sort[1] },
      skip: range[0],
      take: range[1] - range[0] + 1,
    });
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
      reward.account.availableToBeClaimed += reward.numberOfTokens;
      reward.account.totalLocked -= reward.numberOfTokens;

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
      const availableToBeClaimed = unlockDate < now ? numberOfTokens : 0;
      const totalLocked = unlockDate > now ? numberOfTokens : 0;
      if (account) {
        account.availableToBeClaimed =
          account.availableToBeClaimed + availableToBeClaimed;
        account.totalLocked = account.totalLocked + totalLocked;
      } else {
        account = new AccountEntity();
        account.address = address;
        account.availableToBeClaimed = availableToBeClaimed;
        account.totalLocked = totalLocked;
      }
      await this.accountRepository.save(account);
      reward.account = account;
      nRewards.push(reward);
    }
    return nRewards;
  }
  private parseCsv(buffer: Buffer) {
    let rewards = parse(buffer, {
      delimiter: ';',
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

    const now = new Date();
    rewards = rewards.map((line: string[]) => {
      const reward = new RewardEntity();
      reward.address = line[0].toString();
      reward.numberOfTokens = parseInt(line[1], 10);
      reward.unlockDate = new Date(line[2]);
      reward.isUnlocked = reward.unlockDate < now;
      return reward;
    });

    return rewards;
  }
}
