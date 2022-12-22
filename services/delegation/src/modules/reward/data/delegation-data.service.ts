import moment from "moment";
import { Repository } from "typeorm";
import IntervalTree, { Interval } from "@flatten-js/interval-tree";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Node } from "../../node/node.entity";
import { NodeType } from "../../node/node-type.enum";
import { NodeCommission } from "../../node/node-commission.entity";
import { Delegation } from "../../delegation/delegation.entity";

export interface DelegationIntervalValue {
  startsAt: number;
  endsAt: number;
  value: NodeCommission | Delegation;
}

@Injectable()
export class DelegationDataService {
  constructor(
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
    @InjectRepository(NodeCommission)
    private nodeCommissionRepository: Repository<NodeCommission>,
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>
  ) {}
  async getData(endTime: number) {
    const nodes = await this.nodeRepository.find({
      where: {
        type: NodeType.MAINNET,
      },
      order: {
        createdAt: "ASC",
      },
      loadEagerRelations: false,
      withDeleted: true,
    });
    return Promise.all(
      nodes.map(async (node) => ({
        node,
        commissions: await this.getCommissions(node, endTime),
        delegations: await this.getDelegations(node, endTime),
      }))
    );
  }
  private async getCommissions(
    node: Node,
    endTime: number
  ): Promise<IntervalTree<DelegationIntervalValue>> {
    const commissions = await this.nodeCommissionRepository.find({
      where: {
        node,
      },
      order: {
        startsAt: "DESC",
      },
    });

    let lastEndAt = endTime;
    const tree = new IntervalTree<DelegationIntervalValue>();
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
  private async getDelegations(
    node: Node,
    endTime: number
  ): Promise<IntervalTree<DelegationIntervalValue>> {
    const delegations = await this.delegationRepository.find({
      where: {
        node,
      },
      order: {
        startsAt: "ASC",
      },
      withDeleted: true,
    });

    const tree = new IntervalTree<DelegationIntervalValue>();
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
