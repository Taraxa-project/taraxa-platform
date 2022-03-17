import assert from 'assert';
import moment from 'moment';
import _ from 'lodash';
import IntervalTree, { Interval } from '@flatten-js/interval-tree';
import { Connection, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { Reward } from './reward.entity';
import { RewardType } from './reward-type.enum';

import { Node } from '../node/node.entity';
import { NodeType } from '../node/node-type.enum';
import { NodeCommission } from '../node/node-commission.entity';
import { Delegation } from '../delegation/delegation.entity';

interface IntervalValue {
  startsAt: number;
  endsAt: number;
  value: NodeCommission | Delegation;
}

interface Period {
  startsAt: number;
  endsAt: number;
  epoch: number;
}

@Injectable()
export class RewardService {
  private eligibilityThreshold: number;
  constructor(
    private connection: Connection,
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
    @InjectRepository(NodeCommission)
    private nodeCommissionRepository: Repository<NodeCommission>,
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
    private config: ConfigService,
  ) {
    this.eligibilityThreshold = this.config.get<number>(
      'delegation.eligibilityThreshold',
    );
  }
  async calculateRewards(at = moment().utc().unix()) {
    console.log(`Calculating rewards...`);
    await this.rewardRepository.delete({});
    console.log(`Getting nodes...`);
    const nodes = await this.getNodes();
    let cnt = 0;
    for (const node of nodes) {
      cnt++;
      console.group(
        `${cnt}/${nodes.length}: Calculating rewards for node: ${node.id}`,
      );
      await this.calculateRewardsForNode(node, at);
      console.groupEnd();
    }
    console.log(`Done`);
  }
  async calculateRewardsForNode(node: Node, at = moment().utc().unix()) {
    const commissionIntervalTree = await this.getCommissionTree(node, at);
    const delegationIntervalTree = await this.getDelegationTree(node, at);

    console.log(`- commissions: `, commissionIntervalTree.size);
    console.log(`- delegations: `, delegationIntervalTree.size);

    const periods: Period[] = this.getPeriods(
      at,
      ...commissionIntervalTree.items.map((i) => i.value.startsAt),
      ...delegationIntervalTree.items.map((i) => i.value.startsAt),
      ...delegationIntervalTree.items.map((i) => i.value.endsAt),
    );

    console.log(`- periods: `, periods.length);

    for (const period of periods) {
      const { startsAt, endsAt, epoch } = period;
      console.log(`- period ${startsAt}-${endsAt}...`);

      const currentCommissions = commissionIntervalTree.search(
        new Interval(startsAt, endsAt),
      );
      assert(
        currentCommissions.length <= 1,
        'There should be only one commission in the interval',
      );

      if (currentCommissions.length === 0) {
        continue;
      }

      const currentCommission = currentCommissions[0];
      const currentDelegations = [
        ...delegationIntervalTree.search(new Interval(startsAt, endsAt)),
      ];
      const totalDelegationAmount = currentDelegations.reduce(
        (acc: number, cur: IntervalValue) => {
          const delegation = cur.value as Delegation;
          return acc + delegation.value;
        },
        0,
      );

      if (totalDelegationAmount < this.eligibilityThreshold) {
        continue;
      }

      const getRewardEntity = () => {
        const reward = new Reward();
        reward.node = node.id;
        reward.epoch = epoch;
        reward.startsAt = moment.unix(startsAt).utc().toDate();
        reward.endsAt = moment.unix(endsAt).utc().toDate();
        return reward;
      };

      const getNodeRewardEntity = (value: number) => {
        const reward = getRewardEntity();
        reward.user = node.user;
        reward.type = RewardType.NODE;
        reward.value = value;
        return reward;
      };

      const getAccountRewardEntity = (user: number, value: number) => {
        const reward = getRewardEntity();
        reward.user = user;
        reward.type = RewardType.DELEGATOR;
        reward.value = value;
        return reward;
      };

      const commissionEntity = currentCommission.value as NodeCommission;
      for (const currentDelegation of currentDelegations) {
        const delegationEntity = currentDelegation.value as Delegation;
        const totalBalance = this.calculateTotalRewards(
          delegationEntity.value,
          endsAt - startsAt,
        );

        const nodeCommission = (totalBalance * commissionEntity.value) / 100;
        if (nodeCommission > 0) {
          await this.rewardRepository.save(
            getNodeRewardEntity(
              epoch === 0 ? nodeCommission * 2 : nodeCommission,
            ),
          );
        }
        if (epoch !== 0) {
          await this.rewardRepository.save(
            getAccountRewardEntity(
              delegationEntity.user,
              totalBalance - nodeCommission,
            ),
          );
        }
      }
    }
  }
  private calculateTotalRewards(delegationValue: number, seconds: number) {
    const yearlyReward = (delegationValue * 20) / 100;
    const perSeconds = yearlyReward / (365.2425 * 24 * 60 * 60);
    return seconds * perSeconds;
  }
  private getPeriods(endsAt: number, ...points: number[]): Period[] {
    const epochs = [moment('2022-02-15').utc().unix()];
    let currentEpoch = 0;
    do {
      const nextEpoch = moment
        .unix(epochs[currentEpoch])
        .add(1, 'month')
        .utc()
        .unix();
      if (nextEpoch > endsAt) {
        break;
      }
      epochs.push(nextEpoch);
      currentEpoch++;
    } while (true);

    points = [...points, ...epochs];
    points = [...new Set(points)];
    points = _.sortBy(points);

    const periods: Period[] = [];
    let epoch = 0;
    for (let i = 1; i < points.length; i++) {
      const startsAt = points[i - 1];
      const endsAt = points[i] - 1;

      if (endsAt >= epochs[epoch]) {
        epoch++;
      }

      periods.push({
        startsAt,
        endsAt,
        epoch,
      });
    }
    return periods;
  }
  private async getNodes() {
    return this.nodeRepository.find({
      where: {
        type: NodeType.MAINNET,
      },
      order: {
        createdAt: 'ASC',
      },
      loadEagerRelations: false,
    });
  }
  private async getCommissionTree(
    node: Node,
    endTime: number,
  ): Promise<IntervalTree<IntervalValue>> {
    const commissions = await this.nodeCommissionRepository.find({
      where: {
        node,
      },
      order: {
        startsAt: 'DESC',
      },
    });

    let lastEndAt = endTime;
    const tree = new IntervalTree<IntervalValue>();
    for (const commission of commissions) {
      const startsAt = moment(commission.startsAt).utc().unix();
      const endsAt = lastEndAt;
      tree.insert(new Interval(startsAt, endsAt), {
        startsAt,
        endsAt,
        value: commission,
      });
      lastEndAt = startsAt - 1;
    }
    return tree;
  }
  private async getDelegationTree(
    node: Node,
    endTime: number,
  ): Promise<IntervalTree<IntervalValue>> {
    const delegations = await this.delegationRepository.find({
      where: {
        node,
      },
      order: {
        startsAt: 'ASC',
      },
      withDeleted: true,
    });

    const tree = new IntervalTree<IntervalValue>();
    for (const delegation of delegations) {
      const startsAt = delegation.startsAt
        ? moment(delegation.startsAt).utc().unix()
        : moment(delegation.createdAt).utc().unix();
      const endsAt = delegation.endsAt
        ? moment(delegation.endsAt).utc().unix()
        : endTime;

      tree.insert(new Interval(startsAt, endsAt - 1), {
        startsAt,
        endsAt,
        value: delegation,
      });
    }

    return tree;
  }
}
