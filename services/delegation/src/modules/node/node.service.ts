import * as ethers from 'ethers';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, Connection, FindConditions } from 'typeorm';
import { ProfileService } from '../profile/profile.service';
import { NODE_CREATED_EVENT, NODE_DELETED_EVENT } from './node.constants';
import { Node } from './node.entity';
import { NodeType } from './node-type.enum';
import { NodeCommission } from './node-commission.entity';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { ValidationException } from '../utils/exceptions/validation.exception';
import { NodeCreatedEvent } from './event/node-created.event';
import { NodeDeletedEvent } from './event/node-deleted.event';

@Injectable()
export class NodeService {
  constructor(
    private eventEmitter: EventEmitter2,
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
    @InjectRepository(NodeCommission)
    private nodeCommissionRepository: Repository<NodeCommission>,
    private connection: Connection,
    private config: ConfigService,
    private profileService: ProfileService,
  ) {}

  async createNode(user: number, nodeDto: CreateNodeDto): Promise<Node> {
    const { address } = nodeDto;

    try {
      const digest = ethers.utils.keccak256(address);
      const recoveredAddress = ethers.utils.recoverAddress(
        digest,
        nodeDto.addressProof,
      );

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new ValidationException(`Node proof for ${address} is invalid`);
      }
    } catch (e) {
      throw new ValidationException(`Node proof for ${address} is invalid`);
    }

    const existingNode = await this.nodeRepository
      .createQueryBuilder('n')
      .select('COUNT("n"."id")', 'count')
      .where('LOWER("n"."address") = :address', {
        address: address.toLowerCase(),
      })
      .withDeleted()
      .getRawOne();
    const existingNodeCount = parseInt(existingNode.count, 10);

    if (existingNodeCount > 0) {
      throw new ValidationException(
        `Node with address ${address} already exists.`,
      );
    }

    const node = Node.fromDto(nodeDto);
    node.user = user;

    if (node.isMainnet()) {
      try {
        await this.profileService.get(user);
      } catch (e) {
        throw new ValidationException(`User ${user} doesn't have a profile`);
      }
    }

    await this.connection.transaction(async (manager) => {
      if (node.isMainnet()) {
        const commission = NodeCommission.fromValueCreate(nodeDto.commission);
        node.commissions = [commission];
      }
      await manager.save(node);
    });

    this.eventEmitter.emit(
      NODE_CREATED_EVENT,
      new NodeCreatedEvent(
        node.id,
        node.type,
        node.address,
        node.addressProof,
        node.vrfKey,
      ),
    );

    return this.findNodeByOrFail({
      id: node.id,
    });
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

    await this.nodeRepository.save(node);

    return this.findNodeByOrFail({
      id: node.id,
    });
  }

  async createCommission(
    user: number,
    nodeId: number,
    commissionDto: CreateCommissionDto,
  ): Promise<Node> {
    const node = await this.findNodeByOrFail({
      id: nodeId,
      type: NodeType.MAINNET,
      user,
    });

    if (node.hasPendingCommissionChange) {
      throw new ValidationException(
        `Node with id ${node.id} already has a pending commission change.`,
      );
    }

    if (Math.floor(commissionDto.commission) !== commissionDto.commission) {
      throw new ValidationException(
        `New commission has to be between 0 and 100.`,
      );
    }

    if (node.currentCommission === commissionDto.commission) {
      throw new ValidationException(
        `New commission can't be the same as the current commission.`,
      );
    }

    const commissionChangeThreshold = this.config.get<number>(
      'delegation.commissionChangeThreshold',
    );
    if (
      Math.abs(node.currentCommission - commissionDto.commission) >
      commissionChangeThreshold
    ) {
      throw new ValidationException(
        'New commission must be within 5% of the current commission.',
      );
    }

    node.commissions = [
      ...node.commissions,
      NodeCommission.fromValueUpdate(commissionDto.commission),
    ];

    await this.nodeRepository.save(node);

    return this.findNodeByOrFail({
      id: node.id,
    });
  }

  async deleteNode(user: number, node: number): Promise<Node> {
    const n = await this.findNodeByOrFail({
      id: node,
      user,
    });

    if (!n.canDelete) {
      throw new ValidationException(`Node can't be deleted.`);
    }

    await this.nodeRepository.softDelete(node);

    this.eventEmitter.emit(
      NODE_DELETED_EVENT,
      new NodeDeletedEvent(n.id, n.type, n.address),
    );

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
    const nodes = await this.nodeRepository.find({
      type: NodeType.MAINNET,
    });
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

  async findNodes(options: FindConditions<Node>): Promise<Node[]> {
    const node = await this.nodeRepository.find(options);
    return this.decorateNodes(node);
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
