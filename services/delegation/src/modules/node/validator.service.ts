import _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { NodeType } from './node-type.enum';
import { Node } from './node.entity';
import { NodeService } from './node.service';

@Injectable()
export class ValidatorService {
  constructor(private nodeService: NodeService) {}
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
    const sortedNodes = _.sortBy(decoratedNodes, [
      'remainingDelegation',
      'currentCommission',
      'lastBlockCreatedAt',
    ]);
    return sortedNodes;
  }
  async get(id: number, user: number | null): Promise<Partial<Node>> {
    const node = await this.nodeService.findNodeByOrFail({
      id,
      type: NodeType.MAINNET,
    });
    return this.decorateNode(node, user);
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
    };
  }
}
