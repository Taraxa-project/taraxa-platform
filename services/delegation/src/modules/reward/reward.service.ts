import assert from 'assert';
import moment from 'moment';
import { Repository } from 'typeorm';
import { Interval } from '@flatten-js/interval-tree';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
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
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    private stakingDataService: StakingDataService,
    private delegationDataService: DelegationDataService,
    private config: ConfigService,
  ) {
    this.eligibilityThreshold = this.config.get<number>(
      'delegation.eligibilityThreshold',
    );
  }
  async calculateRewards(endTime = moment().utc().unix()) {
    const epochs: Epoch[] = getEpochs(endTime);
    console.log(epochs);
    const stakingData = await this.stakingDataService.getData(endTime);
    const delegationData = await this.delegationDataService.getData(endTime);

    for (const epoch of epochs) {
      if (epoch.epoch < 4) {
        continue;
      }
      console.group(`Calculating rewards for epoch`, {
        epoch: epoch.epoch,
        now: endTime,
        startDate: epoch.startDate,
        endDate: epoch.endDate,
        start: moment.unix(epoch.startDate).utc(),
        end: moment.unix(epoch.endDate).utc(),
      });
      const filterInEpoch = (i: number) =>
        i >= epoch.startDate && i <= epoch.endDate;

      // Calculate Staking Rewards
      if (epoch.epoch <= 3) {
        for (const stake of stakingData) {
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

          let currentReward = 0;
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
            currentReward += calculateYieldFor(
              currentEvent.amount,
              period.endsAt - period.startsAt,
            );
          }

          const reward = new Reward();
          reward.userAddress = stake.user;
          reward.epoch = epoch.epoch;
          reward.startsAt = moment.unix(epoch.startDate).utc().toDate();
          reward.endsAt = moment.unix(epoch.endDate).utc().toDate();
          reward.type = RewardType.STAKING;
          reward.value = currentReward;

          await this.rewardRepository.save(reward);
        }
      }

      // Calculate Delegation Rewards
      if (epoch.epoch > 3) {
        for (const node of delegationData) {
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

          let currentReward = 0;
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
                epoch.endDate - epoch.startDate,
              );

              const nodeCommission =
                (totalBalance * commissionEntity.value) / 100;
              currentReward +=
                epoch.epoch === 4 ? nodeCommission * 2 : nodeCommission;

              if (epoch.epoch !== 4) {
                const reward = new Reward();
                reward.node = node.node.id;
                reward.user = delegationEntity.user;
                reward.epoch = epoch.epoch;
                reward.startsAt = moment.unix(epoch.startDate).utc().toDate();
                reward.endsAt = moment.unix(epoch.endDate).utc().toDate();
                reward.type = RewardType.DELEGATOR;
                reward.value = totalBalance - nodeCommission;
                await this.rewardRepository.save(reward);
              }
            }
          }

          if (currentReward > 0) {
            const reward = new Reward();
            reward.node = node.node.id;
            reward.user = node.node.user;
            reward.epoch = epoch.epoch;
            reward.startsAt = moment.unix(epoch.startDate).utc().toDate();
            reward.endsAt = moment.unix(epoch.endDate).utc().toDate();
            reward.type = RewardType.NODE;
            reward.value = currentReward;
            await this.rewardRepository.save(reward);
          }
        }
      }
      console.groupEnd();
    }
  }
}
