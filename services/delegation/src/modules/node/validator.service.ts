import { Injectable } from '@nestjs/common';
import { NodeType } from './node-type.enum';
import { Node } from './node.entity';
import { NodeService } from './node.service';

@Injectable()
export class ValidatorService {
  constructor(private nodeService: NodeService) {}
  async find(): Promise<Partial<Node>[]> {
    const nodes = await this.nodeService.findAllMainnetNodes();
    return nodes.map((node) => this.decorateNode(node));
  }
  async get(nodeId: number): Promise<Partial<Node>> {
    const node = await this.nodeService.findNodeByTypeAndId(
      NodeType.MAINNET,
      nodeId,
    );
    return this.decorateNode(node);
  }
  private decorateNode(node: Node): Partial<Node> {
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
      remainingDelegation: node.remainingDelegation,
    };
  }
}
