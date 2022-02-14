import assert from 'assert';
import moment from 'moment';
import _ from 'lodash';
import IntervalTree, { Interval } from '@flatten-js/interval-tree';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

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
}

@Injectable()
export class RewardService {
  private eligibilityThreshold: number;
  constructor(
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
  async getRewards(at = moment().utc().unix()) {
    const nodeBalances = new Map<number, number>();
    const accountBalances = new Map<number, number>();

    const nodes = await this.getNodes();
    for (const node of nodes) {
      const { nodeBalance, nodeAccountBalances } = await this.getRewardsForNode(
        node,
        at,
      );

      nodeBalances.set(
        node.user,
        (nodeBalances.get(node.user) || 0) + nodeBalance,
      );

      nodeAccountBalances.forEach((balance, user) => {
        accountBalances.set(user, (accountBalances.get(user) || 0) + balance);
      });
    }

    return {
      nodeBalances,
      accountBalances,
    };
  }
  async getRewardsForNode(node: Node, at = moment().utc().unix()) {
    const commissionIntervalTree = await this.getCommissionTree(node, at);
    const delegationIntervalTree = await this.getDelegationTree(node, at);

    const periods: Period[] = this.getPeriods(
      ...commissionIntervalTree.items.map((i) => i.value.startsAt),
      ...delegationIntervalTree.items.map((i) => i.value.startsAt),
      ...delegationIntervalTree.items.map((i) => i.value.endsAt),
    );

    const getCurrentCommission = (
      startsAt: number,
      endsAt: number,
    ): IntervalValue => {
      const currentCommissions = commissionIntervalTree.search(
        new Interval(startsAt, endsAt),
      );
      assert(
        currentCommissions.length === 1,
        'There should be only one commission in the interval',
      );
      return currentCommissions[0];
    };

    const getCurrentDelegations = (
      startsAt: number,
      endsAt: number,
    ): IntervalValue[] => {
      return [...delegationIntervalTree.search(new Interval(startsAt, endsAt))];
    };

    const getTotalDelegationAmount = (delegations: IntervalValue[]): number => {
      return delegations.reduce((acc: number, cur: IntervalValue) => {
        const delegation = cur.value as Delegation;
        return acc + delegation.value;
      }, 0);
    };

    let nodeBalance = 0;
    const nodeAccountBalances = new Map<number, number>();

    for (const period of periods) {
      const { startsAt, endsAt } = period;

      const currentCommission = getCurrentCommission(startsAt, endsAt);
      const currentDelegations = getCurrentDelegations(startsAt, endsAt);
      const totalDelegationAmount =
        getTotalDelegationAmount(currentDelegations);

      if (totalDelegationAmount < this.eligibilityThreshold) {
        continue;
      }

      const commissionEntity = currentCommission.value as NodeCommission;
      for (const currentDelegation of currentDelegations) {
        const delegationEntity = currentDelegation.value as Delegation;
        const totalBalance = this.calculateTotalRewards(
          delegationEntity.value,
          endsAt - startsAt,
        );
        const nodePeriodBalance = (totalBalance * commissionEntity.value) / 100;
        const accountPeriodBalance = totalBalance - nodePeriodBalance;

        nodeBalance += nodePeriodBalance;
        nodeAccountBalances.set(
          delegationEntity.user,
          (nodeAccountBalances.get(delegationEntity.user) || 0) +
            accountPeriodBalance,
        );
      }
    }

    return {
      nodeBalance,
      nodeAccountBalances,
    };
  }
  private calculateTotalRewards(delegationValue: number, seconds: number) {
    const yearlyReward = (delegationValue * 20) / 100;
    const perSeconds = yearlyReward / (365.2425 * 24 * 60 * 60);
    return seconds * perSeconds;
  }
  private getPeriods(...points: number[]): Period[] {
    points = [...new Set(points)];
    points = _.sortBy(points);

    const periods: Period[] = [];
    for (let i = 1; i < points.length; i++) {
      const startsAt = points[i - 1];
      const endsAt = points[i] - 1;

      periods.push({
        startsAt,
        endsAt,
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
    now: number,
  ): Promise<IntervalTree<IntervalValue>> {
    const commissions = await this.nodeCommissionRepository.find({
      where: {
        node,
      },
      order: {
        startsAt: 'DESC',
      },
    });

    let lastEndAt = now;
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
    now: number,
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
        : now;

      tree.insert(new Interval(startsAt, endsAt - 1), {
        startsAt,
        endsAt,
        value: delegation,
      });
    }

    return tree;
  }
}
