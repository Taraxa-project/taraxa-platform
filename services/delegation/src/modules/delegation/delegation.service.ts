import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '../utils/exceptions/validation.exception';
import { NodeService } from '../node/node.service';
import { Node } from '../node/node.entity';
import { StakingService } from '../staking/staking.service';
import { Delegation } from './delegation.entity';
import { DelegationNonce } from './delegation-nonce.entity';
import { CreateDelegationDto } from './dto/create-delegation.dto';
import { CreateDelegationNonceDto } from './dto/create-delegation-nonce.dto';
import { BalancesDto } from './dto/balances.dto';
import { NodeType } from '../node/node-type.enum';

@Injectable()
export class DelegationService {
  constructor(
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
    @InjectRepository(DelegationNonce)
    private delegationNonceRepository: Repository<DelegationNonce>,
    private config: ConfigService,
    private nodeService: NodeService,
    private stakingService: StakingService,
  ) {}
  async getBalances(address: string): Promise<BalancesDto> {
    const total = await this.stakingService.getStakingAmount(address);
    const delegated = await this.getUserDelegations(address);
    return {
      total,
      delegated,
      remaining: total - delegated,
    };
  }
  find(user: number): Promise<Delegation[]> {
    return this.delegationRepository.find({
      user,
    });
  }
  async getNonce(user: number, address: string, node: Node): Promise<string> {
    const nonce = await this.delegationNonceRepository.findOne({
      user,
      address,
      node,
    });

    return `Delegate to ${nonce.node.address}, from ${nonce.address} with nonce #${nonce.value}`;
  }
  async createNonce(
    user: number,
    delegationNonceDto: CreateDelegationNonceDto,
  ): Promise<string> {
    const node = await this.nodeService.findNodeByOrFail({
      id: delegationNonceDto.node,
      type: NodeType.MAINNET,
    });

    let nonce = await this.delegationNonceRepository.findOne({
      user,
      address: delegationNonceDto.from,
      node: node,
    });

    if (nonce) {
      nonce.value = nonce.value + 1;
    } else {
      nonce = new DelegationNonce();
      nonce.user = user;
      nonce.address = delegationNonceDto.from;
      nonce.node = node;
      nonce.value = 1;
    }
    await this.delegationNonceRepository.save(nonce);

    return this.getNonce(user, delegationNonceDto.from, node);
  }

  async create(
    user: number,
    delegationDto: CreateDelegationDto,
  ): Promise<Delegation> {
    const node = await this.nodeService.findNodeByOrFail({
      id: delegationDto.node,
      type: NodeType.MAINNET,
    });

    console.log('proof', delegationDto.proof);

    const userDelegationsToNode = await this.getUserDelegationsToNode(
      user,
      node.address,
    );
    const minDelegation = this.config.get<number>('delegation.minDelegation');
    if (userDelegationsToNode + delegationDto.value < minDelegation) {
      throw new ValidationException(
        'Minimum delegation value is ' + minDelegation,
      );
    }

    const nodeDelegations = await this.getNodeDelegations(node.id);
    const maxDelegation = this.config.get<number>('delegation.maxDelegation');
    if (nodeDelegations + delegationDto.value > maxDelegation) {
      throw new ValidationException(
        'Maximum delegation exceeded. Node can only be delegated ' +
          (maxDelegation - nodeDelegations) +
          ' more tokens.',
      );
    }

    const userDelegations = await this.getUserDelegations(delegationDto.from);
    const totalUserStake = await this.stakingService.getStakingAmount(
      delegationDto.from,
    );
    if (userDelegations + delegationDto.value > totalUserStake) {
      throw new ValidationException(
        'Maximum stake exceeded. User can only delegate ' +
          (totalUserStake - userDelegations) +
          ' more tokens.',
      );
    }

    const delegation = Delegation.fromDto(delegationDto);
    delegation.user = user;
    delegation.node = node;

    return this.delegationRepository.save(delegation);
  }

  private async getUserDelegationsToNode(user: number, address: string) {
    const d = await this.delegationRepository
      .createQueryBuilder('d')
      .select('SUM("d"."value")', 'total')
      .where('"d"."user" = :user', { user })
      .andWhere('"d"."address" = :address', { address })
      .getRawOne();

    return parseInt(d.total, 10) || 0;
  }

  private async getNodeDelegations(nodeId: number) {
    const d = await this.delegationRepository
      .createQueryBuilder('d')
      .select('SUM("d"."value")', 'total')
      .where('"d"."nodeId" = :node', { node: nodeId })
      .getRawOne();
    return parseInt(d.total, 10) || 0;
  }

  private async getUserDelegations(address: string) {
    const d = await this.delegationRepository
      .createQueryBuilder('d')
      .select('SUM("d"."value")', 'total')
      .where('"d"."address" = :address', { address })
      .getRawOne();
    return parseInt(d.total, 10) || 0;
  }
}
