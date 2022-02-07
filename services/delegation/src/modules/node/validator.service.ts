import _ from 'lodash';
import { Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { NodeType } from './node-type.enum';
import { Node } from './node.entity';
import { NodeService } from './node.service';
import { Delegation } from '../delegation/delegation.entity';

@Injectable()
export class ValidatorService {
  constructor(
    private nodeService: NodeService,
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
  ) {}
  async find(
    user: number | null,
    showMyValidators: boolean,
    showFullyDelegated: boolean,
  ): Promise<Partial<Node>[]> {
    let nodes = await this.nodeService.findAllMainnetNodes();
    if (showMyValidators && user !== null) {
      nodes = nodes.filter((node) => {
        return node.delegations.some((delegation) => delegation.user === user);
      });
    }
    if (!showFullyDelegated) {
      nodes = nodes.filter((node) => node.remainingDelegation > 0);
    }
    const decoratedNodes = nodes.map((node) => this.decorateNode(node, user));
    let sortedNodes = _.sortBy(decoratedNodes, [
      'remainingDelegation',
      'currentCommission',
    ]);
    sortedNodes = _.sortBy(decoratedNodes, ['isActive']).reverse();
    sortedNodes = _.sortBy(decoratedNodes, ['isTopNode']).reverse();
    return sortedNodes;
  }
  async get(id: number, user: number | null): Promise<Partial<Node>> {
    const node = await this.nodeService.findNodeByOrFail({
      id,
      type: NodeType.MAINNET,
    });
    return this.decorateNode(node, user);
  }
  async getDelegations(
    id: number,
    user: number | null,
    showMyDelegationAtTheTop = false,
    page = 1,
  ): Promise<{ count: number; data: Partial<Delegation>[] }> {
    const node = await this.nodeService.findNodeByOrFail({
      id,
      type: NodeType.MAINNET,
    });

    const perPage = 20;
    let q = this.delegationRepository
      .createQueryBuilder('d')
      .where('"d"."nodeId" = :node', { node: node.id })
      .take(perPage)
      .skip((page - 1) * perPage)
      .orderBy(`d.user = ${node.user}`, 'DESC');

    if (showMyDelegationAtTheTop && user !== null) {
      q = q.orderBy(`d.user == ${user}`, 'DESC');
    }

    const [result, total] = await q.getManyAndCount();

    return {
      count: total,
      data: result.map((delegation) => ({
        ...delegation,
        isOwnDelegation: delegation.user === user,
        isSelfDelegation: delegation.user === node.user,
      })),
    };
  }
  private decorateNode(node: Node, user: number | null): Partial<Node> {
    return {
      ..._.pick(node, [
        'id',
        'user',
        'name',
        'address',
        'blocksProduced',
        'weeklyBlocksProduced',
        'weeklyRank',
        'lastBlockCreatedAt',
        'yield',
        'hasPendingCommissionChange',
        'pendingCommission',
        'currentCommission',
        'totalDelegation',
        'ownDelegation',
        'remainingDelegation',
        'isActive',
        'isTopNode',
      ]),
      canUndelegate: node.canUserUndelegate(user),
      isOwnValidator: node.isUserOwnValidator(user),
      profile: node.profile
        ? {
            ..._.pick(node.profile, ['description', 'website', 'social']),
          }
        : null,
    };
  }
}
