import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { NodeNotFoundException } from '../node/exceptions/node-not-found-exception';
import { NodeService } from '../node/node.service';
import { StakingService } from '../staking/staking.service';
import { Delegation } from './delegation.entity';
import { CreateDelegationDto } from './dto/create-delegation.dto';

@Injectable()
export class DelegationService {
  constructor(
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
    private config: ConfigService,
    private nodeService: NodeService,
    private stakingService: StakingService,
  ) {}
  find(user: number): Promise<Delegation[]> {
    return this.delegationRepository.find({
      user,
    });
  }
  async create(
    user: number,
    delegationDto: CreateDelegationDto,
  ): Promise<Delegation> {
    const node = await this.nodeService.findNodeOrThrow(delegationDto.node);

    if (node.isTestnet()) {
      throw new NodeNotFoundException(delegationDto.node);
    }

    const userDelegationsToNode = await this.delegationRepository
      .createQueryBuilder('d')
      .select('SUM("d"."value")', 'total')
      .where('"d"."user" = :user', { user })
      .andWhere('"d"."address" = :address', { address: delegationDto.from })
      .getRawOne();
    const currentUserDelegationsToNode =
      parseInt(userDelegationsToNode.total, 10) || 0;
    const minDelegation = this.config.get<number>('delegation.minDelegation');
    if (currentUserDelegationsToNode + delegationDto.value < minDelegation) {
      throw new Error('Minimum delegation value is ' + minDelegation);
    }

    const nodeDelegations = await this.delegationRepository
      .createQueryBuilder('d')
      .select('SUM("d"."value")', 'total')
      .where('"d"."nodeId" = :node', { node: node.id })
      .getRawOne();
    const currentNodeDelegations = parseInt(nodeDelegations.total, 10) || 0;
    const maxDelegation = this.config.get<number>('delegation.maxDelegation');
    if (currentNodeDelegations + delegationDto.value > maxDelegation) {
      throw new Error(
        'Maximum delegation exceeded. Node can only be delegated ' +
          (maxDelegation - currentNodeDelegations) +
          ' more tokens.',
      );
    }

    const userDelegations = await this.delegationRepository
      .createQueryBuilder('d')
      .select('SUM("d"."value")', 'total')
      .where('"d"."address" = :address', { address: delegationDto.from })
      .getRawOne();
    const currentUserDelegations = parseInt(userDelegations.total, 10) || 0;
    const totalUserStake = await this.stakingService.getStakingAmount(
      delegationDto.from,
    );
    if (currentUserDelegations + delegationDto.value > totalUserStake) {
      throw new Error(
        'Maximum stake exceeded. User can only delegate ' +
          (totalUserStake - currentUserDelegations) +
          ' more tokens.',
      );
    }

    const delegation = Delegation.fromDto(delegationDto);
    delegation.user = user;
    delegation.node = node;

    return this.delegationRepository.save(delegation);
  }
}
