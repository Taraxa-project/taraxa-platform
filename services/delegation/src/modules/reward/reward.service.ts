import assert from 'assert';
import moment from 'moment';
import * as ethers from 'ethers';
import { Raw, Repository } from 'typeorm';
import { Interval } from '@flatten-js/interval-tree';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { RewardQueryDto } from './dto/reward-query.dto';
import { StakingDataService } from './data/staking-data.service';
import {
  DelegationIntervalValue,
  DelegationDataService,
} from './data/delegation-data.service';
import { Epoch, getEpochs } from './helper/epoch';
import { Period, getPeriods } from './helper/period';
import { calculateYieldFor } from './helper/yield';

import { Delegation } from '../delegation/delegation.entity';
import { Node } from '../node/node.entity';
import { NodeCommission } from '../node/node-commission.entity';
import { Reward } from './reward.entity';
import { RewardRepository } from './reward.repository';
import { RewardType } from './reward-type.enum';

@Injectable()
export class RewardService {
  private eligibilityThreshold: number;
  constructor(
    private stakingDataService: StakingDataService,
    private delegationDataService: DelegationDataService,
    @InjectRepository(Reward)
    private rewardRepository: RewardRepository,
    private config: ConfigService,
    private userService: UserService,
  ) {
    this.eligibilityThreshold = this.config.get<number>(
      'delegation.eligibilityThreshold',
    );
  }
  async calculateRewardsForNextEpoch(endTime = moment().utc().unix()) {
    const e = await this.rewardRepository
      .createQueryBuilder('r')
      .select('MAX("r"."epoch")', 'epoch')
      .getRawOne();
    const epoch = parseInt(e.epoch, 10) + 1 || 0;

    await this.rewardRepository.delete({
      epoch,
    });

    const epochs: Epoch[] = getEpochs(endTime).filter((e) => e.epoch === epoch);
    if (epochs.length === 0) {
      throw new Error(`Next epoch (${epoch}) not found.`);
    }

    const stakingData = await this.stakingDataService.getData(endTime);
    const delegationData = await this.delegationDataService.getData(endTime);

    await this.calculateForEpoch(epochs[0], stakingData, delegationData);
  }
  async calculateRewardsForEpoch(
    epoch: number,
    endTime = moment().utc().unix(),
  ) {
    await this.rewardRepository.delete({
      epoch,
    });

    const epochs: Epoch[] = getEpochs(endTime).filter((e) => e.epoch === epoch);
    if (epochs.length === 0) {
      throw new Error(`Epoch ${epoch} not found.`);
    }

    const stakingData = await this.stakingDataService.getData(endTime);
    const delegationData = await this.delegationDataService.getData(endTime);

    await this.calculateForEpoch(epochs[0], stakingData, delegationData);
  }
  async calculateRewards(endTime = moment().utc().unix()) {
    await this.rewardRepository.delete({});
    const stakingData = await this.stakingDataService.getData(endTime);
    const delegationData = await this.delegationDataService.getData(endTime);

    const epochs: Epoch[] = getEpochs(endTime);
    for (const epoch of epochs) {
      await this.calculateForEpoch(epoch, stakingData, delegationData);
    }
    console.log('done');
  }
  async getRewards(query: RewardQueryDto) {
    const { type, epoch, user, address } = query;

    let rewardsQuery = this.rewardRepository
      .createQueryBuilder('r')
      .leftJoinAndMapOne('r.node', Node, 'n', 'r.node = n.id')
      .orderBy('r.epoch', 'ASC')
      .addOrderBy('r.startsAt', 'ASC')
      .withDeleted();

    if (type) {
      rewardsQuery = rewardsQuery.andWhere('r.type = :type', { type });
    }
    if (epoch) {
      rewardsQuery = rewardsQuery.andWhere('r.epoch = :epoch', { epoch });
    }
    if (user) {
      rewardsQuery = rewardsQuery.andWhere('r.user = :user', { user });
    }

    if (address) {
      rewardsQuery = rewardsQuery.andWhere({
        userAddress: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
          address,
        }),
      });
    }

    const rewards = JSON.parse(JSON.stringify(await rewardsQuery.getMany()));
    const rewardResponse = rewards.map((r) => {
      const n = r.node;
      if (n) {
        r.node = {
          id: n.id,
          name: n.name,
          address: n.address,
        };
      } else {
        r.node = null;
      }
      return r;
    });

    return rewardResponse;
  }
  private async calculateForEpoch(epoch: Epoch, stakingData, delegationData) {
    console.group(
      `Calculating rewards for epoch ${epoch.epoch} (${moment
        .unix(epoch.startDate)
        .utc()} - ${moment.unix(epoch.endDate).utc()})`,
    );
    const filterInEpoch = (i: number) =>
      i >= epoch.startDate && i <= epoch.endDate;

    const isStakingRewardsActive = epoch.epoch <= 3;
    const isDelegationRewardsActive = epoch.epoch >= 2;
    const isDoubleNodeRewardsActive = epoch.epoch === 3;
    const isDelegationDelegatorsRewardsActive = epoch.epoch > 3;

    // Calculate Staking Rewards
    console.group(`Calculating staking rewards`);
    if (isStakingRewardsActive) {
      let i = 0;
      for (const stake of stakingData) {
        i++;
        console.log(`- ${i}/${stakingData.length} ${stake.user}`);
        const periods: Period[] = getPeriods(
          epoch.startDate,
          epoch.endDate,
          ...stake.events.items
            .map((i) => i.value.startsAt)
            .filter(filterInEpoch),
          ...stake.events.items
            .map((i) => i.value.endsAt)
            .filter(filterInEpoch),
        );

        for (const period of periods) {
          const currentStake = stake.events.search(
            new Interval(period.startsAt, period.endsAt),
          );
          assert(
            currentStake.length <= 1,
            'There should be only one event in the interval',
          );
          if (currentStake.length === 0) {
            continue;
          }
          const currentEvent = currentStake[0].value;
          const stakingReward = calculateYieldFor(
            currentEvent.amount,
            period.endsAt - period.startsAt,
          );

          if (stakingReward > 0) {
            const reward = this.getNewStakingRewardEntity(epoch, period);
            reward.userAddress = stake.user;
            reward.value = stakingReward;
            reward.user = await this.getUserIdByAddress(stake.user);
            reward.commission = 0;
            reward.originalAmount = currentEvent.amount;
            await this.rewardRepository.save(reward);
          }
        }
      }
    }
    console.groupEnd();

    // Calculate Delegation Rewards
    console.group(`Calculating delegation rewards`);
    if (isDelegationRewardsActive) {
      let i = 0;
      for (const node of delegationData) {
        i++;
        console.log(`- ${i}/${delegationData.length} ${node.node.address}`);
        const periods: Period[] = getPeriods(
          epoch.startDate,
          epoch.endDate,
          ...node.commissions.items
            .map((i) => i.value.startsAt)
            .filter(filterInEpoch),
          ...node.delegations.items
            .map((i) => i.value.startsAt)
            .filter(filterInEpoch),
          ...node.delegations.items
            .map((i) => i.value.endsAt)
            .filter(filterInEpoch),
        );
        for (const period of periods) {
          const currentCommissions = node.commissions.search(
            new Interval(period.startsAt, period.endsAt),
          );

          assert(
            currentCommissions.length <= 1,
            'There should be only one commission in the interval',
          );
          if (currentCommissions.length === 0) {
            continue;
          }

          const currentCommission = currentCommissions[0];
          const currentDelegations: DelegationIntervalValue[] = [
            ...node.delegations.search(
              new Interval(period.startsAt, period.endsAt),
            ),
          ];
          const totalDelegationAmount = currentDelegations.reduce(
            (acc: number, cur: DelegationIntervalValue) => {
              const delegation = cur.value as Delegation;
              return acc + delegation.value;
            },
            0,
          );

          if (totalDelegationAmount < this.eligibilityThreshold) {
            continue;
          }

          const commissionEntity = currentCommission.value as NodeCommission;
          for (const currentDelegation of currentDelegations) {
            const delegationEntity = currentDelegation.value as Delegation;
            const totalBalance = calculateYieldFor(
              delegationEntity.value,
              period.endsAt - period.startsAt,
            );

            const nodeCommission =
              (totalBalance * commissionEntity.value) / 100;
            const nodeRewards = isDoubleNodeRewardsActive
              ? nodeCommission * 2
              : nodeCommission;

            if (nodeRewards > 0) {
              const reward = this.getNewNodeRewardEntity(epoch, period);
              reward.node = node.node.id;
              reward.user = node.node.user;
              reward.userAddress = await this.getUserAddressById(
                node.node.user,
              );
              reward.value = nodeRewards;
              reward.commission = commissionEntity.value;
              reward.originalAmount = delegationEntity.value;
              await this.rewardRepository.save(reward);
            }

            if (isDelegationDelegatorsRewardsActive) {
              const reward = this.getNewDelegatorRewardEntity(epoch, period);
              reward.node = node.node.id;
              reward.user = delegationEntity.user;
              reward.userAddress = delegationEntity.address;
              reward.value = totalBalance - nodeCommission;
              reward.commission = commissionEntity.value;
              reward.originalAmount = delegationEntity.value;
              await this.rewardRepository.save(reward);
            }
          }
        }
      }
    }
    console.groupEnd();
    console.groupEnd();
  }
  private getNewStakingRewardEntity(epoch: Epoch, period: Period) {
    const reward = this.getNewRewardEntity(epoch, period);
    reward.type = RewardType.STAKING;
    return reward;
  }
  private getNewNodeRewardEntity(epoch: Epoch, period: Period) {
    const reward = this.getNewRewardEntity(epoch, period);
    reward.type = RewardType.NODE;
    return reward;
  }
  private getNewDelegatorRewardEntity(epoch: Epoch, period: Period) {
    const reward = this.getNewRewardEntity(epoch, period);
    reward.type = RewardType.DELEGATOR;
    return reward;
  }
  private getNewRewardEntity(epoch: Epoch, period: Period) {
    const reward = new Reward();
    reward.epoch = epoch.epoch;
    reward.startsAt = moment.unix(period.startsAt).utc().toDate();
    reward.endsAt = moment.unix(period.endsAt).utc().toDate();
    return reward;
  }
  private async getUserIdByAddress(address: string): Promise<number | null> {
    try {
      const user = await this.userService.getUserByAddress(address);
      return user.id;
    } catch (e) {
      return null;
    }
  }
  private async getUserAddressById(id: number): Promise<string | null> {
    let address = null;
    try {
      const user = await this.userService.getUserById(id);
      if (user.ethWallet) {
        address = ethers.utils.getAddress(user.ethWallet);
      }
    } catch (e) {
      return null;
    }
    return address;
  }
}
