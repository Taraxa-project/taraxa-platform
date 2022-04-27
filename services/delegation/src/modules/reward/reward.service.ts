import assert from 'assert';
import moment from 'moment';
import * as ethers from 'ethers';
import { Repository } from 'typeorm';
import { Interval } from '@flatten-js/interval-tree';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { StakingDataService } from './data/staking-data.service';
import {
  DelegationIntervalValue,
  DelegationDataService,
} from './data/delegation-data.service';
import { Epoch, getEpochs } from './helper/epoch';
import { Period, getPeriods } from './helper/period';
import { calculateYieldFor } from './helper/yield';

import { Delegation } from '../delegation/delegation.entity';
import { NodeCommission } from '../node/node-commission.entity';
import { Reward } from './reward.entity';
import { RewardType } from './reward-type.enum';

@Injectable()
export class RewardService {
  private eligibilityThreshold: number;
  constructor(
    private stakingDataService: StakingDataService,
    private delegationDataService: DelegationDataService,
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    private config: ConfigService,
    private userService: UserService,
  ) {
    this.eligibilityThreshold = this.config.get<number>(
      'delegation.eligibilityThreshold',
    );
  }
  async calculateRewards(endTime = moment().utc().unix()) {
    await this.rewardRepository.delete({});
    const stakingData = await this.stakingDataService.getData(endTime);
    const delegationData = await this.delegationDataService.getData(endTime);

    const epochs: Epoch[] = getEpochs(endTime);
    for (const epoch of epochs) {
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
                await this.rewardRepository.save(reward);
              }

              if (isDelegationDelegatorsRewardsActive) {
                const reward = this.getNewDelegatorRewardEntity(epoch, period);
                reward.node = node.node.id;
                reward.user = delegationEntity.user;
                reward.userAddress = delegationEntity.address;
                reward.value = totalBalance - nodeCommission;
                await this.rewardRepository.save(reward);
              }
            }
          }
        }
      }
      console.groupEnd();
      console.groupEnd();
    }
    console.log('done');
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
