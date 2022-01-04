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
    let nodes = await this.nodeService.findAllMainnetNodes(user);
    if (showMyValidators && user !== null) {
      nodes = nodes.filter((node) => {
        return node.delegations.some((delegation) => delegation.user === user);
      });
    }
    if (!showFullyDelegated) {
      nodes = nodes.filter((node) => node.remainingDelegation > 0);
    }
    return nodes.map((node) => this.decorateNode(node, user));
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
      id: node.id,
      user: node.user,
      name: node.name,
      address: node.address,
      blocksProduced: node.blocksProduced,
      weeklyBlocksProduced: node.weeklyBlocksProduced,
      weeklyRank: node.weeklyRank,
      lastBlockCreatedAt: node.lastBlockCreatedAt,
      yield: node.yield,
      hasPendingCommissionChange: node.hasPendingCommissionChange,
      pendingCommission: node.pendingCommission,
      currentCommission: node.currentCommission,
      totalDelegation: node.totalDelegation,
      ownDelegation: node.ownDelegation,
      remainingDelegation: node.remainingDelegation,
      isTopNode: node.isTopNode,
      canUndelegate: node.canUserUndelegate(user),
    };
  }
}
