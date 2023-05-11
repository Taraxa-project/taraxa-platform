import * as ethUtil from 'ethereumjs-util';
import * as abi from 'ethereumjs-abi';
import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { In, LessThan, Raw, Repository } from 'typeorm';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ethereum, general, reward } from '@taraxa-claim/config';
import { CollectionResponse, QueryDto } from '@taraxa-claim/common';
import { BatchTypes } from './type/batch-type';
import { BatchEntity } from './entity/batch.entity';
import { PendingRewardEntity } from './entity/pending-reward.entity';
import { RewardEntity } from './entity/reward.entity';
import { AccountEntity } from './entity/account.entity';
import { AccountClaimEntity } from './entity/account-claim.entity';
import { ClaimEntity } from './entity/claim.entity';
import { AddressChangesEntity } from './entity/address-changes.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { PendingRewardsDto } from './dto/pending-rewards.dto';
import { GraphQLService } from './graphql.connector.service';

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

enum RewardType {
  COMMUNITY = 'COMMUNITY',
  DELEGATION = 'DELEGATION',
}

interface Reward {
  address: string;
  total: number;
  type: RewardType;
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
    @InjectRepository(AddressChangesEntity)
    private readonly addressChangeRepository: Repository<AddressChangesEntity>,
    @Inject(general.KEY)
    private readonly generalConfig: ConfigType<typeof general>,
    @Inject(ethereum.KEY)
    private readonly ethereumConfig: ConfigType<typeof ethereum>,
    @Inject(reward.KEY)
    private readonly rewardConfig: ConfigType<typeof reward>,
    private readonly graphService: GraphQLService,
  ) {
    this.privateKey = Buffer.from(this.ethereumConfig.privateSigningKey, 'hex');
  }
  public async createBatch(batchDto: CreateBatchDto): Promise<BatchEntity> {
    let batch = new BatchEntity();
    batch.type = BatchTypes[batchDto.type];
    batch.name = batchDto.name;
    batch.isDraft = true;

    batch = await this.batchRepository.save(batch);

    if (batch.type === BatchTypes.COMMUNITY_ACTIVITY) {
      const kyc = await this.getKycStatus();
      const rewards = [
        ...(await this.getCommunityRewards()),
        ...(await this.getDelegationRewards()),
      ];
      for (const reward of rewards) {
        const address = this.toChecksumAddress(reward.address);

        let total = new BigNumber(0);
        let claimable = new BigNumber(0);
        let communityTotal = new BigNumber(0);
        let delegationTotal = new BigNumber(0);

        let isValid = true;
        let invalidReason = null;

        let pendingReward = await this.pendingRewardRepository.findOne({
          address,
          batch,
        });

        if (pendingReward) {
          total = total.plus(new BigNumber(pendingReward.total));
          communityTotal = communityTotal.plus(
            new BigNumber(pendingReward.communityTotal),
          );
          delegationTotal = delegationTotal.plus(
            new BigNumber(pendingReward.delegationTotal),
          );
        } else {
          pendingReward = new PendingRewardEntity();
          pendingReward.batch = batch;
          pendingReward.address = address;
        }

        total = total.plus(this.floatToBn(reward.total));
        claimable = claimable.plus(total);

        if (reward.type === RewardType.COMMUNITY) {
          communityTotal = communityTotal.plus(this.floatToBn(reward.total));
        }

        if (reward.type === RewardType.DELEGATION) {
          delegationTotal = delegationTotal.plus(this.floatToBn(reward.total));
        }

        const calculateTotalAccount = (a: AccountEntity) =>
          new BigNumber(a.availableToBeClaimed)
            .plus(new BigNumber(a.totalLocked))
            .plus(new BigNumber(a.totalClaimed));

        const account = await this.accountRepository.findOne({
          address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
            address,
          }),
        });

        if (account) {
          const totalBefore = calculateTotalAccount(account);
          claimable = claimable.minus(totalBefore);
        }

        if (!ethUtil.isValidAddress(address)) {
          isValid = false;
          invalidReason = 'Invalid address';
        }

        if (!kyc.has(address)) {
          isValid = false;
          invalidReason = 'KYC not approved';
        }

        if (claimable.isNegative()) {
          isValid = false;
          invalidReason = 'Negative balance';
        }

        pendingReward.claimable = claimable.toString(10);
        pendingReward.total = total.toString(10);
        pendingReward.communityTotal = communityTotal.toString(10);
        pendingReward.delegationTotal = delegationTotal.toString(10);
        pendingReward.isValid = isValid;
        pendingReward.invalidReason = invalidReason;

        await this.pendingRewardRepository.save(pendingReward);
      }

      const changedAddresses = (
        await this.addressChangeRepository.find()
      ).reduce((prev: Map<string, string>, curr: AddressChangesEntity) => {
        prev.set(
          this.toChecksumAddress(curr.oldAddress),
          this.toChecksumAddress(curr.newAddress),
        );
        return prev;
      }, new Map<string, string>());

      for (const [oldAddress, newAddress] of changedAddresses.entries()) {
        const oldAddressReward = await this.pendingRewardRepository.findOne({
          address: oldAddress,
        });
        let claimable = new BigNumber('0');
        if (oldAddressReward) {
          oldAddressReward.isValid = false;
          oldAddressReward.invalidReason = 'Changed Address';
          claimable.plus(new BigNumber(oldAddressReward.claimable));
          await this.pendingRewardRepository.save(oldAddressReward);
        }
        const newAddressReward = await this.pendingRewardRepository.findOne({
          address: newAddress,
        });
        if (newAddressReward) {
          claimable = claimable.plus(new BigNumber(newAddressReward.claimable));
          newAddressReward.claimable = claimable.toString(10);
          if (claimable.isNegative()) {
            newAddressReward.isValid = false;
            newAddressReward.invalidReason = 'Negative balance';
          }
          await this.pendingRewardRepository.save(newAddressReward);
        }
      }
    }

    return batch;
  }

  public async batch(id: number): Promise<BatchEntity> {
    return this.batchRepository.findOneOrFail({ id });
  }
  public async getPendingRewardsForBatch(
    id: number,
  ): Promise<PendingRewardsDto> {
    const batch = await this.batchRepository.findOneOrFail({ id });
    const pendingRewards = await this.pendingRewardRepository.find({
      where: { batch },
      order: { invalidReason: 'DESC' },
    });

    let total = 0,
      validTotal = 0,
      claimable = 0,
      validClaimable = 0,
      communityTotal = 0,
      validCommunityTotal = 0,
      delegationTotal = 0,
      validDelegationTotal = 0;
    const rewards = await Promise.all(
      pendingRewards.map(async (pendingReward) => {
        const { address } = pendingReward;

        const bnStringToNumber = (s: string) => {
          return new BigNumber(s).div(new BigNumber(10).pow(18)).toNumber();
        };

        total += bnStringToNumber(pendingReward.total);
        claimable += bnStringToNumber(pendingReward.claimable);
        communityTotal += bnStringToNumber(pendingReward.communityTotal);
        delegationTotal += bnStringToNumber(pendingReward.delegationTotal);
        if (pendingReward.isValid) {
          validTotal += bnStringToNumber(pendingReward.total);
          validClaimable += bnStringToNumber(pendingReward.claimable);
          validCommunityTotal += bnStringToNumber(pendingReward.communityTotal);
          validDelegationTotal += bnStringToNumber(
            pendingReward.delegationTotal,
          );
        }

        let availableToBeClaimed = 0;
        let locked = 0;
        let claimed = 0;

        const account = await this.accountRepository.findOne({
          address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
            address,
          }),
        });
        if (account) {
          availableToBeClaimed = bnStringToNumber(account.availableToBeClaimed);
          locked = bnStringToNumber(account.totalLocked);
          claimed = bnStringToNumber(account.totalClaimed);
        }
        return {
          availableToBeClaimed,
          locked,
          claimed,
          newAvailableToBeClaimed:
            availableToBeClaimed + bnStringToNumber(pendingReward.claimable),
          newClaimable: bnStringToNumber(pendingReward.claimable),
          total: bnStringToNumber(pendingReward.total),
          id: pendingReward.id,
          address: pendingReward.address,
          isValid: pendingReward.isValid,
          invalidReason: pendingReward.invalidReason,
        };
      }),
    );

    return {
      rewards,
      total,
      validTotal,
      claimable,
      validClaimable,
      communityTotal,
      validCommunityTotal,
      delegationTotal,
      validDelegationTotal,
    };
  }
  public async patchBatch(
    id: number,
    batchDto: UpdateBatchDto,
  ): Promise<BatchEntity> {
    let batch = await this.batchRepository.findOneOrFail({ id });
    if (!batch.isDraft) {
      return batch;
    }
    if (batchDto.isDraft) {
      return batch;
    }
    batch.isDraft = batchDto.isDraft;
    batch = await this.batchRepository.save(batch);

    const pendingRewards = await this.pendingRewardRepository.find({
      isValid: true,
    });

    const now = new Date();
    const rewards: RewardEntity[] = [];
    for (const pendingReward of pendingRewards) {
      const reward = new RewardEntity();
      reward.batch = batch;
      reward.address = pendingReward.address;
      reward.numberOfTokens = pendingReward.claimable;
      reward.isUnlocked = true;
      reward.unlockDate = now;

      let account = await this.accountRepository.findOne({
        address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
          address: pendingReward.address,
        }),
      });
      if (account) {
        const availableToBeClaimed = new BigNumber(
          account.availableToBeClaimed,
        ).plus(new BigNumber(pendingReward.claimable));
        account.availableToBeClaimed = availableToBeClaimed.toString(10);
      } else {
        account = new AccountEntity();
        account.address = pendingReward.address;
        account.availableToBeClaimed = pendingReward.claimable;
        account.totalLocked = '0';
        account.totalClaimed = '0';
      }

      account = await this.accountRepository.save(account);
      reward.account = account;
      rewards.push(reward);
    }

    await this.rewardRepository.save(rewards);
    return batch;
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
    const claim = await this.claimRepository.findOne({
      where: {
        address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
          address,
        }),
        claimed: false,
      },
    });

    if (claim) {
      const isClaimed = await this.isClaimClaimed(claim);
      if (isClaimed) {
        await this.markAsClaimed(claim);
      }
    }

    const accountData = await this.accountRepository.findOne({
      address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
        address,
      }),
    });

    if (accountData) {
      const account = JSON.parse(JSON.stringify(accountData));
      delete account.id;
      return account;
    } else throw new NotFoundException();
  }
  public async createClaim(address: string): Promise<ClaimEntity> {
    const unclaimed = await this.claimRepository.findOne({
      address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
        address,
      }),
      claimed: false,
    });

    if (unclaimed) return unclaimed;

    const { availableToBeClaimed } = await this.accountRepository.findOneOrFail(
      {
        address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
          address,
        }),
      },
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
  public async markAsClaimed(claim: ClaimEntity): Promise<void | ClaimEntity> {
    if (!claim) {
      return;
    }

    claim.claimed = true;
    claim.claimedAt = new Date();

    const account = await this.accountRepository.findOneOrFail({
      address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
        address: claim.address,
      }),
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
  public async isClaimClaimed(claim: ClaimEntity): Promise<boolean> {
    if (!claim) {
      return false;
    }

    const { address, numberOfTokens } = claim;

    const nonce = claim.id * 13;
    const indexedClaim = await this.graphService.getClaim(
      address,
      numberOfTokens,
      nonce,
    );
    if (indexedClaim) {
      const confirmation = ethers.BigNumber.from(indexedClaim.amount);
      if (
        confirmation.gt(ethers.BigNumber.from('0')) &&
        confirmation.eq(ethers.BigNumber.from(numberOfTokens))
      ) {
        return true;
      }
    }

    return false;
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
  public async getClaimsFor(
    address: string,
  ): Promise<CollectionResponse<ClaimEntity>> {
    const claims = new CollectionResponse<ClaimEntity>();
    [claims.data, claims.count] = await this.claimRepository.findAndCount({
      where: {
        address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
          address,
        }),
      },
    });
    claims.data = claims.data.map((claim: ClaimEntity) => ({
      ...claim,
      numberOfTokens: this.bNStringToString(claim.numberOfTokens),
    }));
    return claims;
  }
  public async getUnclaimedClaims(): Promise<ClaimEntity[]> {
    const claims = await this.claimRepository.find({
      where: {
        claimed: false,
      },
    });

    return claims;
  }
  public async getAccountRewards(
    account: AccountEntity,
  ): Promise<RewardEntity[]> {
    const rewards = await this.rewardRepository.find({
      where: {
        account,
      },
    });

    return rewards;
  }
  public async getAccountClaims(
    account: AccountEntity,
  ): Promise<ClaimEntity[]> {
    const rewards = await this.claimRepository.find({
      where: {
        address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
          address: account.address,
        }),
      },
    });

    return rewards;
  }
  public async getAllAccounts(): Promise<AccountEntity[]> {
    const accounts = await this.accountRepository.find();
    return accounts;
  }
  public async saveAccount(account: AccountEntity): Promise<AccountEntity> {
    return await this.accountRepository.save(account);
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
  private async getKycStatus(): Promise<Map<string, boolean>> {
    const response = await this.httpService
      .get<CommunityKycResponse[]>(
        `${this.rewardConfig.communitySiteApiUrl}/kyc`,
      )
      .toPromise();

    if (response.status !== 200) {
      throw new Error('Failed to get kyc statuses');
    }

    const kyc = response.data;
    const kycStatus = new Map<string, boolean>();
    for (const k of kyc) {
      kycStatus.set(this.toChecksumAddress(k.address), k.kyc === 'APPROVED');
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

    const rewards = response.data.map((r) => ({
      ...r,
      type: RewardType.COMMUNITY,
    }));
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
      address: reward.address,
      total: reward.amount,
      type: RewardType.DELEGATION,
    }));
  }
  private toChecksumAddress(address: string): string {
    const trimmedAddress = address.trim().toLowerCase();
    return ethUtil.isValidAddress(trimmedAddress)
      ? ethUtil.toChecksumAddress(trimmedAddress)
      : trimmedAddress;
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
