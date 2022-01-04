import * as ethUtil from 'ethereumjs-util';
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
import { BalancesByNodeDto } from './dto/balances-by-node.dto';
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
  async getBalancesByNode(
    wallet: string,
    node: number,
  ): Promise<BalancesByNodeDto> {
    const delegated = await this.getUserDelegationsToNode(wallet, node);
    return {
      delegated,
    };
  }
  find(user: number): Promise<Delegation[]> {
    return this.delegationRepository.find({
      user,
    });
  }
  async getNonce(user: number, address: string, node: Node): Promise<string> {
    const nonce = await this.delegationNonceRepository.findOneOrFail({
      user,
      address,
      node,
    });

    return `Delegate to ${nonce.node.address}, from ${nonce.address} with nonce #${nonce.value}`;
  }
  async getAndUpdateNonce(
    user: number,
    address: string,
    node: Node,
  ): Promise<string> {
    const nonce = await this.delegationNonceRepository.findOneOrFail({
      user,
      address,
      node,
    });

    const nonceString = `Delegate to ${nonce.node.address}, from ${nonce.address} with nonce #${nonce.value}`;

    nonce.value = nonce.value + 1;
    await this.delegationNonceRepository.save(nonce);

    return nonceString;
  }

  async createNonce(
    user: number,
    delegationNonceDto: CreateDelegationNonceDto,
  ): Promise<string> {
    const node = await this.nodeService.findNodeByOrFail({
      id: delegationNonceDto.node,
      type: NodeType.MAINNET,
    });

    const nonceExists = await this.delegationNonceRepository.findOne({
      user,
      address: delegationNonceDto.from,
      node: node,
    });

    if (!nonceExists) {
      const nonce = new DelegationNonce();
      nonce.user = user;
      nonce.address = delegationNonceDto.from;
      nonce.node = node;
      nonce.value = 1;
      await this.delegationNonceRepository.save(nonce);
    }

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

    const nonce = await this.getAndUpdateNonce(user, delegationDto.from, node);
    const nonceBuffer = ethUtil.toBuffer(ethUtil.fromUtf8(nonce));
    const nonceHash = ethUtil.hashPersonalMessage(nonceBuffer);

    const { v, r, s } = ethUtil.fromRpcSig(delegationDto.proof);
    const address = ethUtil.bufferToHex(
      ethUtil.pubToAddress(ethUtil.ecrecover(nonceHash, v, r, s)),
    );

    if (
      address.toLocaleLowerCase() !== delegationDto.from.toLocaleLowerCase()
    ) {
      throw new ValidationException('Invalid proof');
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

  async ensureMainnetDelegation(address: string, delegation: number) {
    const currentDelegation = await this.stakingService.getMainnetStake(
      address,
    );
    if (currentDelegation === delegation) {
      return;
    }

    if (currentDelegation > delegation) {
      await this.stakingService.undelegateMainnetTransaction(
        address,
        currentDelegation - delegation,
      );
    } else {
      await this.stakingService.delegateMainnetTransaction(
        address,
        delegation - currentDelegation,
      );
    }
  }

  async ensureTestnetDelegation(address: string) {
    await this.stakingService.delegateTestnetTransaction(address);
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

  private async getUserDelegationsToNode(address: string, node: number) {
    const d = await this.delegationRepository
      .createQueryBuilder('d')
      .select('SUM("d"."value")', 'total')
      .where('"d"."address" = :address', { address })
      .andWhere('"d"."nodeId" = :node', { node })
      .getRawOne();
    return parseInt(d.total, 10) || 0;
  }
}
