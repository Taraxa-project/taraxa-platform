import * as ethUtil from 'ethereumjs-util';
import * as abi from 'ethereumjs-abi';
import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { In, LessThan, Raw, Repository } from 'typeorm';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ethereum, general, reward } from '@taraxa-claim/config';
import { CollectionResponse, QueryDto } from '@taraxa-claim/common';
import { BlockchainService, ContractTypes } from '@taraxa-claim/blockchain';
import { BatchTypes } from './type/batch-type';
import { BatchEntity } from './entity/batch.entity';
import { PendingRewardEntity } from './entity/pending-reward.entity';
import { RewardEntity } from './entity/reward.entity';
import { AccountEntity } from './entity/account.entity';
import { AccountClaimEntity } from './entity/account-claim.entity';
import { ClaimEntity } from './entity/claim.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { PendingRewardDto } from './dto/pending-reward.dto';

interface CommunityRewardResponse {
  address: string;
  total: number;
}

interface CommunityKycResponse {
  address: string;
  kyc: string;
}

interface DelegationRewardResponse {
  address: string;
  amount: number;
}

interface KycStatus {
  [address: string]: string;
}

interface Reward {
  address: string;
  total: number;
}

interface FilteredReward {
  address: string;
  total: BigNumber;
}

@Injectable()
export class ClaimService {
  privateKey: Buffer;
  constructor(
    private httpService: HttpService,
    @InjectRepository(BatchEntity)
    private readonly batchRepository: Repository<BatchEntity>,
    @InjectRepository(PendingRewardEntity)
    private readonly pendingRewardRepository: Repository<PendingRewardEntity>,
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
    @Inject(reward.KEY)
    private readonly rewardConfig: ConfigType<typeof reward>,
    private readonly blockchainService: BlockchainService,
  ) {
    this.privateKey = Buffer.from(this.ethereumConfig.privateSigningKey, 'hex');
  }
  public async createBatch(batchDto: CreateBatchDto): Promise<BatchEntity> {
    let batch = new BatchEntity();
    batch.type = BatchTypes[batchDto.type];
    batch.name = batchDto.name;
    batch.isDraft = true;

    batch = await this.batchRepository.save(batch);

    const kycStatus = await this.getKycStatus();

    if (batch.type === BatchTypes.COMMUNITY_ACTIVITY) {
      await this.savePendingRewards(
        this.filterRewards(await this.getCommunityRewards(), kycStatus),
        batch,
      );
      await this.savePendingRewards(
        this.filterRewards(await this.getDelegationRewards(), kycStatus),
        batch,
      );
    }

    return batch;
  }
  public async batch(id: number): Promise<BatchEntity> {
    return this.batchRepository.findOneOrFail({ id });
  }
  public async getPendingRewardsForBatch(
    id: number,
  ): Promise<PendingRewardDto[]> {
    const batch = await this.batchRepository.findOneOrFail({ id });
    const pendingRewards = await this.pendingRewardRepository.find({ batch });

    return Promise.all(
      pendingRewards.map(async (pendingReward) => {
        const { address } = pendingReward;

        const account = await this.accountRepository.findOne({
          address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
            address,
          }),
        });

        const bnStringToNumber = (s: string) => {
          const ten = new BigNumber(10);
          return new BigNumber(s).div(ten.pow(18)).toNumber();
        };

        let current = 0;
        let claimed = 0;
        let locked = 0;
        let availableToBeClaimed = 0;
        const total = bnStringToNumber(pendingReward.numberOfTokens);

        if (account) {
          const totalBefore = new BigNumber(account.totalClaimed)
            .plus(new BigNumber(account.totalLocked))
            .plus(new BigNumber(account.availableToBeClaimed));
          current = new BigNumber(pendingReward.numberOfTokens)
            .minus(totalBefore)
            .div(new BigNumber(10).pow(18))
            .toNumber();
          claimed = bnStringToNumber(account.totalClaimed);
          locked = bnStringToNumber(account.totalLocked);
          availableToBeClaimed = bnStringToNumber(account.availableToBeClaimed);
        }

        return {
          current,
          claimed,
          locked,
          total,
          availableToBeClaimed,
          id: pendingReward.id,
          address: pendingReward.address,
        };
      }),
    );
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
        .map((reward) => reward.address)
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
    try {
      const claim = await this.claimRepository.findOne({
        where: { address, claimed: false },
      });
      if (claim) {
        const nonce = claim.id * 13;

        const claimContractInstance =
          this.blockchainService.getContractInstance(
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
    } catch (error) {
      const err = error as Error;
      throw new InternalServerErrorException(err.message);
    }
    const accountData = await this.accountRepository.findOne({ address });
    if (accountData) {
      const account = JSON.parse(JSON.stringify(accountData));
      delete account.id;
      return account;
    } else throw new NotFoundException();
  }
  public async createClaim(address: string): Promise<ClaimEntity> {
    const unclaimed = await this.claimRepository.findOne({
      address,
      claimed: false,
    });

    if (unclaimed) return unclaimed;

    const { availableToBeClaimed } = await this.accountRepository.findOneOrFail(
      { address },
    );

    if (
      ethers.BigNumber.from(availableToBeClaimed).lte(ethers.BigNumber.from(0))
    ) {
      throw new Error('No tokens to claim');
    }

    const claim = new ClaimEntity();
    claim.address = address;
    claim.numberOfTokens = availableToBeClaimed;

    const newClaim = await this.claimRepository.save(claim);
    return newClaim;
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
  public async patchClaim(id: number): Promise<Partial<AccountClaimEntity>> {
    const claim = await this.claimRepository.findOneOrFail({ id });

    const nonce = claim.id * 13;
    const encodedPayload = abi.soliditySHA3(
      ['address', 'uint', 'uint'],
      [claim.address, claim.numberOfTokens, nonce],
    );

    const { v, r, s } = ethUtil.ecsign(encodedPayload, this.privateKey);
    const hash = ethUtil.toRpcSig(v, r, s);

    return {
      nonce,
      hash,
      availableToBeClaimed: claim.numberOfTokens,
    };
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
  private async getKycStatus(): Promise<KycStatus> {
    const response = await this.httpService
      .get<CommunityKycResponse[]>(
        `${this.rewardConfig.communitySiteApiUrl}/kyc`,
      )
      .toPromise();

    if (response.status !== 200) {
      throw new Error('Failed to get kyc statuses');
    }

    const kyc = response.data;
    const kycStatus: KycStatus = {};

    for (const k of kyc) {
      if (!ethUtil.isValidAddress(k.address)) {
        continue;
      }

      if (k.kyc !== 'APPROVED') {
        continue;
      }

      const address = ethUtil.toChecksumAddress(k.address.trim());
      kycStatus[address] = k.kyc;
    }

    return kycStatus;
  }
  private async getCommunityRewards(): Promise<Reward[]> {
    const response = await this.httpService
      .get<CommunityRewardResponse[]>(
        `${this.rewardConfig.communitySiteApiUrl}/reward`,
      )
      .toPromise();

    if (response.status !== 200) {
      throw new Error('Failed to get community rewards');
    }

    const rewards = response.data;
    return rewards;
  }
  private async getDelegationRewards(): Promise<Reward[]> {
    const response = await this.httpService
      .get<DelegationRewardResponse[]>(
        `${this.rewardConfig.delegationApiUrl}/rewards/total`,
      )
      .toPromise();

    if (response.status !== 200) {
      throw new Error('Failed to get delegation rewards');
    }

    const rewards = response.data;
    return rewards.map((reward: DelegationRewardResponse) => ({
      ...reward,
      total: reward.amount,
    }));
  }
  private filterRewards(
    rewards: Reward[],
    kycStatus: KycStatus,
  ): FilteredReward[] {
    return rewards
      .filter((reward: Reward) => ethUtil.isValidAddress(reward.address))
      .filter((reward: Reward) => kycStatus[reward.address] === 'APPROVED')
      .map((reward: Reward) => ({
        address: ethUtil.toChecksumAddress(reward.address.trim()),
        total: this.floatToBn(reward.total),
      }));
  }
  private async savePendingRewards(
    rewards: FilteredReward[],
    batch: BatchEntity,
  ): Promise<BatchEntity> {
    for (const reward of rewards) {
      let pendingReward = await this.pendingRewardRepository.findOne({
        relations: ['batch'],
        where: {
          batch: batch,
          address: reward.address,
        },
      });
      if (pendingReward) {
        pendingReward.numberOfTokens = new BigNumber(
          pendingReward.numberOfTokens,
        )
          .plus(reward.total)
          .toString(10);
      } else {
        pendingReward = new PendingRewardEntity();
        pendingReward.address = reward.address;
        pendingReward.numberOfTokens = reward.total.toString(10);
        pendingReward.batch = batch;
      }

      await this.pendingRewardRepository.save(pendingReward);
    }

    return batch;
  }
  private floatToBn(i: number): BigNumber {
    const num = new BigNumber(parseFloat(i.toFixed(3)));
    return num.times(new BigNumber(10).pow(18));
  }
  private bNStringToString(i: string): string {
    const precision = this.generalConfig.precision;
    const numberOfTokens =
      ethers.BigNumber.from(i)
        .div(ethers.BigNumber.from(10).pow(18 - precision))
        .toNumber() / ethers.BigNumber.from(10).pow(precision).toNumber();

    return numberOfTokens.toString();
  }
}
