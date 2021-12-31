import * as ethers from 'ethers';
import moment from 'moment';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, Connection, MoreThan, FindConditions } from 'typeorm';
import { ProfileService } from '../profile/profile.service';
import { Node } from './node.entity';
import { NodeType } from './node-type.enum';
import { NodeCommission } from './node-commission.entity';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { ValidationException } from '../utils/exceptions/validation.exception';

@Injectable()
export class NodeService {
  constructor(
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
    @InjectRepository(NodeCommission)
    private nodeCommissionRepository: Repository<NodeCommission>,
    private connection: Connection,
    private config: ConfigService,
    private profileService: ProfileService,
  ) {}

  async createNode(user: number, nodeDto: CreateNodeDto): Promise<Node> {
    nodeDto.address = ethers.utils.getAddress(nodeDto.address);

    const nodeExists = await this.nodeRepository.findOne({
      address: nodeDto.address,
    });

    if (nodeExists) {
      throw new ValidationException(
        `Node with address ${nodeDto.address} already exists`,
      );
    }

    const node = Node.fromDto(nodeDto);
    node.user = user;

    try {
      const digest = ethers.utils.keccak256(node.address);
      const recoveredAddress = ethers.utils.recoverAddress(
        digest,
        nodeDto.addressProof,
      );

      if (recoveredAddress !== node.address) {
        throw new ValidationException(
          `Node proof for ${node.address} is invalid`,
        );
      }
    } catch (e) {
      throw new ValidationException(
        `Node proof for ${node.address} is invalid`,
      );
    }

    if (node.isMainnet()) {
      try {
        await this.profileService.get(user);
      } catch (e) {
        throw new ValidationException(`User ${user} doesn't have a profile`);
      }
    }

    await this.connection.transaction(async (manager) => {
      await manager.save(node);

      if (node.isMainnet()) {
        const commission = NodeCommission.fromValueCreate(nodeDto.commission);
        commission.node = node;
        await manager.save(commission);
      }
    });

    return node;
  }

  async updateNode(
    user: number,
    nodeId: number,
    nodeDto: UpdateNodeDto,
  ): Promise<Node> {
    const node = await this.findNodeByOrFail({
      id: nodeId,
      user,
    });

    if (typeof nodeDto.name !== 'undefined') {
      node.name = nodeDto.name;
    }

    if (typeof nodeDto.ip !== 'undefined') {
      node.ip = nodeDto.ip;
    }

    return this.nodeRepository.save(node);
  }

  async createCommission(
    user: number,
    node: number,
    commissionDto: CreateCommissionDto,
  ): Promise<Node> {
    const n = await this.findNodeByOrFail({
      id: node,
      type: NodeType.MAINNET,
      user,
    });

    if (n.commissions.length > 1) {
      const coolingOffPeriodDays = this.config.get<number>(
        'delegation.coolingOffPeriodDays',
      );
      const currentCommissionCount = await this.nodeCommissionRepository.count({
        createdAt: MoreThan(
          moment().utc().subtract(coolingOffPeriodDays, 'days').toDate(),
        ),
        node: n,
      });

      if (currentCommissionCount >= 1) {
        throw new ValidationException(
          `Node with id ${n.id} already has a pending commission change.`,
        );
      }
    }

    const commission = NodeCommission.fromValueUpdate(commissionDto.commission);
    n.commissions = [...n.commissions, commission];

    return this.nodeRepository.save(n);
  }

  async deleteNode(user: number, node: number): Promise<Node> {
    const n = await this.findNodeByOrFail({
      id: node,
      user,
      type: NodeType.TESTNET,
    });
    await this.nodeRepository.delete(node);

    return n;
  }

  async findAllNodesByUserAndType(
    user: number,
    type: NodeType = NodeType.TESTNET,
  ): Promise<Node[]> {
    const nodes = await this.nodeRepository.find({ user, type });
    return this.decorateNodes(nodes);
  }

  async findAllMainnetNodes(): Promise<Node[]> {
    const nodes = await this.nodeRepository.find({ type: NodeType.MAINNET });
    return this.decorateNodes(nodes);
  }

  async findNodeByUserAndId(user: number, nodeId: number): Promise<Node> {
    const node = await this.nodeRepository.findOneOrFail({
      user,
      id: nodeId,
    });

    return this.decorateNode(node);
  }

  async findAllCommissionsByNode(
    user: number,
    node: number,
  ): Promise<NodeCommission[]> {
    const n = await this.findNodeByOrFail({
      id: node,
      user,
    });

    return this.nodeCommissionRepository.find({ node: n });
  }

  async findNodeByOrFail(options: FindConditions<Node>): Promise<Node> {
    const node = await this.nodeRepository.findOneOrFail(options);
    return this.decorateNode(node);
  }

  private decorateNode(node: Node): Node {
    const delegationYield = this.config.get<number>('delegation.yield');
    const maxDelegation = this.config.get<number>('delegation.maxDelegation');

    node.yield = delegationYield;
    node.remainingDelegation = maxDelegation - node.totalDelegation;
    return node;
  }

  private decorateNodes(nodes: Node[]): Node[] {
    return nodes.map((node) => this.decorateNode(node));
  }
}
