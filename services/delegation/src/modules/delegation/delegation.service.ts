import * as ethUtil from 'ethereumjs-util';
import moment from 'moment';
import { BigNumber, ethers } from 'ethers';
import {
  Connection,
  FindConditions,
  FindOneOptions,
  Raw,
  Repository,
} from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ValidationException } from '../utils/exceptions/validation.exception';
import { Node } from '../node/node.entity';
import { NodeType } from '../node/node-type.enum';
import { StakingService } from '../staking/staking.service';
import {
  BLOCKCHAIN_TESTNET_INSTANCE_TOKEN,
  BLOCKCHAIN_MAINNET_INSTANCE_TOKEN,
} from '../blockchain/blockchain.constant';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Delegation } from './delegation.entity';
import { DelegationNonce } from './delegation-nonce.entity';
import {
  DELEGATION_CREATED_EVENT,
  DELEGATION_DELETED_EVENT,
} from './delegation.constants';
import { DelegationCreatedEvent } from './event/delegation-created.event';
import { DelegationDeletedEvent } from './event/delegation-deleted.event';
import { CreateDelegationDto } from './dto/create-delegation.dto';
import { CreateUndelegationDto } from './dto/create-undelegation.dto';
import { CreateDelegationNonceDto } from './dto/create-delegation-nonce.dto';
import { CreateUndelegationNonceDto } from './dto/create-undelegation-nonce.dto';
import { BalancesDto } from './dto/balances.dto';
import { BalancesByNodeDto } from './dto/balances-by-node.dto';
import { Undelegation } from './undelegation.entity';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class DelegationService {
  private testnetDelegationAmount: ethers.BigNumber;
  private mainnetDelegationAmount: ethers.BigNumber;
  private maxDelegationPerNode: number;
  private undelegationBlockDelay: number;
  constructor(
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
    @InjectRepository(Undelegation)
    private undelegationRepository: Repository<Undelegation>,
    @InjectRepository(DelegationNonce)
    private delegationNonceRepository: Repository<DelegationNonce>,
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
    private eventEmitter: EventEmitter2,
    private config: ConfigService,
    private stakingService: StakingService,
    private httpService: HttpService,
    private connection: Connection,
    @Inject(BLOCKCHAIN_TESTNET_INSTANCE_TOKEN)
    private testnetBlockchainService: BlockchainService,
    @Inject(BLOCKCHAIN_MAINNET_INSTANCE_TOKEN)
    private mainnetBlockchainService: BlockchainService,
  ) {
    this.testnetDelegationAmount = this.config.get<ethers.BigNumber>(
      'delegation.testnetDelegation',
    );
    this.mainnetDelegationAmount = this.config.get<ethers.BigNumber>(
      'delegation.mainnetDelegation',
    );
    this.maxDelegationPerNode = this.config.get<number>(
      'delegation.maxDelegation',
    );
    this.undelegationBlockDelay = this.config.get<number>(
      'delegation.undelegationConfirmationDelay',
    );
  }
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
    const undelegatable = await this.getUserUndelegatableDelegationsToNode(
      wallet,
      node,
    );
    return {
      delegated,
      undelegatable,
    };
  }
  find(user: number): Promise<Delegation[]> {
    return this.delegationRepository.find({
      user,
    });
  }

  async getAndUpdateDelegationNonce(
    user: number,
    address: string,
    nodeId: number,
  ): Promise<string> {
    const nonceString = await this.getDelegationNonce(user, address, nodeId);
    await this.incrementNonce(user, address, nodeId);

    return nonceString;
  }

  async getAndUpdateUndelegationNonce(
    user: number,
    address: string,
    nodeId: number,
  ): Promise<string> {
    const nonceString = await this.getUndelegationNonce(user, address, nodeId);
    await this.incrementNonce(user, address, nodeId);

    return nonceString;
  }

  async createDelegationNonce(
    user: number,
    delegationNonceDto: CreateDelegationNonceDto,
  ): Promise<string> {
    const { from, node } = delegationNonceDto;
    await this.createNonce(user, from, node);
    return this.getDelegationNonce(user, delegationNonceDto.from, node);
  }

  async createUndelegationNonce(
    user: number,
    delegationNonceDto: CreateUndelegationNonceDto,
  ): Promise<string> {
    const { from, node } = delegationNonceDto;
    await this.createNonce(user, from, node);
    return this.getUndelegationNonce(user, delegationNonceDto.from, node);
  }

  async create(
    user: number,
    delegationDto: CreateDelegationDto,
  ): Promise<Delegation> {
    const node = await this.nodeRepository.findOneOrFail({
      id: delegationDto.node,
      type: NodeType.MAINNET,
    });

    let nonce: string;

    try {
      nonce = await this.getAndUpdateDelegationNonce(
        user,
        delegationDto.from,
        node.id,
      );
    } catch (e) {
      throw new ValidationException('Nonce not found');
    }

    const nonceBuffer = ethUtil.toBuffer(ethUtil.fromUtf8(nonce));
    const nonceHash = ethUtil.hashPersonalMessage(nonceBuffer);

    let address: string;
    try {
      const { v, r, s } = ethUtil.fromRpcSig(delegationDto.proof);
      address = ethUtil.bufferToHex(
        ethUtil.pubToAddress(ethUtil.ecrecover(nonceHash, v, r, s)),
      );
    } catch (e) {
      throw new ValidationException('Invalid proof');
    }

    if (
      address.toLocaleLowerCase() !== delegationDto.from.toLocaleLowerCase()
    ) {
      throw new ValidationException('Invalid proof');
    }

    const totalUserStake = await this.stakingService.getStakingAmount(
      delegationDto.from,
    );
    const userDelegations = await this.getUserDelegations(delegationDto.from);
    if (userDelegations + delegationDto.value > totalUserStake) {
      throw new ValidationException(
        'Maximum stake exceeded. User can only delegate ' +
          (totalUserStake - userDelegations) +
          ' more tokens.',
      );
    }

    const nodeDelegations = await this.getTotalNodeDelegation(node.id);
    if (nodeDelegations + delegationDto.value > this.maxDelegationPerNode) {
      throw new ValidationException(
        'Maximum delegation exceeded. Node can only be delegated ' +
          (this.maxDelegationPerNode - nodeDelegations) +
          ' more tokens.',
      );
    }

    const delegation = Delegation.fromDto(delegationDto);
    delegation.user = user;
    delegation.node = node;

    const createdDelegation = await this.delegationRepository.save(delegation);

    this.eventEmitter.emit(
      DELEGATION_CREATED_EVENT,
      new DelegationCreatedEvent(createdDelegation.id),
    );

    return createdDelegation;
  }

  async delete(
    user: number,
    undelegationDto: CreateUndelegationDto,
  ): Promise<void> {
    const node = await this.nodeRepository.findOneOrFail({
      id: undelegationDto.node,
      type: NodeType.MAINNET,
    });

    let nonce: string;

    try {
      nonce = await this.getAndUpdateUndelegationNonce(
        user,
        undelegationDto.from,
        node.id,
      );
    } catch (e) {
      throw new ValidationException('Nonce not found');
    }

    const nonceBuffer = ethUtil.toBuffer(ethUtil.fromUtf8(nonce));
    const nonceHash = ethUtil.hashPersonalMessage(nonceBuffer);

    let address: string;
    try {
      const { v, r, s } = ethUtil.fromRpcSig(undelegationDto.proof);
      address = ethUtil.bufferToHex(
        ethUtil.pubToAddress(ethUtil.ecrecover(nonceHash, v, r, s)),
      );
    } catch (e) {
      throw new ValidationException('Invalid proof');
    }

    if (
      address.toLocaleLowerCase() !== undelegationDto.from.toLocaleLowerCase()
    ) {
      throw new ValidationException('Invalid proof');
    }

    const totalUndelegatable = await this.getUserUndelegatableDelegationsToNode(
      undelegationDto.from,
      node.id,
    );
    if (undelegationDto.value > totalUndelegatable) {
      throw new ValidationException(
        `Can only undelegate ${totalUndelegatable} tokens`,
      );
    }

    await this.undelegate(
      undelegationDto.from,
      undelegationDto.value,
      user,
      node,
    );
  }

  async findDelegationByOrFail(
    conditions: FindConditions<Delegation>,
    options?: FindOneOptions<Delegation>,
  ): Promise<Delegation> {
    return this.delegationRepository.findOneOrFail(conditions, options);
  }

  async ensureDelegation(nodeId: number, type: string, address: string) {
    // Check if node exists in the database
    let node: Node;
    try {
      node = await this.nodeRepository.findOneOrFail({ id: nodeId });
    } catch (e) {
      node = null;
    }

    // Amount of delegation the node should have
    let totalNodeDelegation = ethers.BigNumber.from(0);
    if (node) {
      if (type === NodeType.TESTNET) {
        totalNodeDelegation = this.testnetDelegationAmount;
      }

      if (type === NodeType.MAINNET) {
        totalNodeDelegation = totalNodeDelegation
          .add(await this.getTotalNodeDelegation(nodeId))
          .mul(this.mainnetDelegationAmount);
      }
    }

    // Amount of delegation the node has
    let currentDelegation = ethers.BigNumber.from('0');
    let isNodeRegistered = false;
    try {
      if (type === NodeType.TESTNET) {
        const validator = await this.testnetBlockchainService.getValidator(
          address,
        );
        currentDelegation = validator.total_stake;
        isNodeRegistered = true;
      }

      if (type === NodeType.MAINNET) {
        const validator = await this.mainnetBlockchainService.getValidator(
          address,
        );
        currentDelegation = validator.total_stake;
        isNodeRegistered = true;
      }
    } catch (e) {
      currentDelegation = ethers.BigNumber.from('0');
    }

    if (currentDelegation.eq(totalNodeDelegation)) {
      return;
    }

    if (currentDelegation.gt(totalNodeDelegation)) {
      const amountToUndelegate = currentDelegation.sub(totalNodeDelegation);
      await this.registerUndelegation(nodeId, address, amountToUndelegate);
      // add call to undelegation, create undelegation, save in db
      // await this.blockchainService.unregisterValidator(address);
    } else {
      if (!isNodeRegistered) {
        let isCreatedOnchain: boolean;
        if (type === NodeType.TESTNET) {
          isCreatedOnchain =
            await this.testnetBlockchainService.registerValidator(
              address,
              node.addressProof,
              node.vrfKey,
            );
        }
        if (node) {
          node.isCreatedOnchain = isCreatedOnchain;
          await this.nodeRepository.save(node);
        }
      }
    }
  }

  async unDelegateAll(type: string, address: string) {
    if (type === NodeType.MAINNET) {
      const node = await this.nodeRepository.findOne({ where: { address } });
      await this.ensureDelegation(node?.id, NodeType.MAINNET, address);
    } else {
      // await this.ensureTestnetDelegation(address, ethers.BigNumber.from(0));
    }
  }

  async getDelegation(
    address: string,
    type: 'mainnet' | 'testnet',
  ): Promise<ethers.BigNumber> {
    const formattedAddress = address.toLowerCase();
    const currentDelegations = await this.getDelegationsFor(type);
    return currentDelegations[formattedAddress]
      ? ethers.BigNumber.from(currentDelegations[formattedAddress])
      : ethers.BigNumber.from(0);
  }

  async getDelegationsFor(
    type: 'mainnet' | 'testnet',
  ): Promise<{ [address: string]: string }> {
    let endpoint: string;
    let delegatorAddress: string;
    if (type === 'mainnet') {
      endpoint = this.config.get<string>('ethereum.mainnetEndpoint');
      delegatorAddress = this.stakingService.mainnetWalletAddress;
    } else {
      endpoint = this.config.get<string>('ethereum.testnetEndpoint');
      delegatorAddress = this.stakingService.testnetWalletAddress;
    }
    const formattedAddress = delegatorAddress.toLowerCase();
    const state = await this.httpService
      .post(
        endpoint,
        {
          jsonrpc: '2.0',
          method: 'taraxa_queryDPOS',
          params: [
            {
              account_queries: {
                [formattedAddress]: {
                  inbound_deposits_addrs_only: false,
                  outbound_deposits_addrs_only: false,
                  with_inbound_deposits: true,
                  with_outbound_deposits: true,
                  with_staking_balance: true,
                },
              },
              with_eligible_count: true,
            },
          ],
          id: 1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .toPromise();

    if (state.status !== 200) {
      throw new Error('Failed to get DPOS stake');
    }

    return state.data.result.account_results[formattedAddress]
      .outbound_deposits;
  }

  async getDelegators() {
    const d = this.delegationRepository
      .createQueryBuilder('d')
      .select('"d"."address"')
      .groupBy('"d"."address"')
      .getRawMany();
    return d;
  }

  async undelegate(
    from: string,
    value: number,
    user?: number,
    node?: Node,
  ): Promise<void> {
    const deleteEvents: number[] = [];
    const createEvents: number[] = [];

    let delegations: Delegation[];
    await this.connection.transaction(async (manager) => {
      const delegationRepository =
        manager.getRepository<Delegation>('Delegation');
      let where: {
        user?: number;
        node?: Node;
      } = {};
      if (user) {
        where = {
          ...where,
          user,
        };
      }
      if (node) {
        where = {
          ...where,
          node,
        };
      }

      delegations = await delegationRepository.find({
        where: {
          ...where,
          address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
            address: from,
          }),
        },
        order: {
          createdAt: 'ASC',
        },
        relations: ['node'],
      });

      let remaining = value;
      const now = moment().utc().toDate();
      for (const delegation of delegations) {
        if (remaining <= 0) {
          break;
        }

        if (remaining < delegation.value) {
          const newDelegation = new Delegation();
          newDelegation.user = delegation.user;
          newDelegation.node = delegation.node;
          newDelegation.address = from;
          newDelegation.value = delegation.value - remaining;
          newDelegation.startsAt = now;
          newDelegation.createdAt = delegation.createdAt;

          const nd = await delegationRepository.save(newDelegation);
          createEvents.push(nd.id);
        }

        delegation.endsAt = now;
        delegation.deletedAt = now;
        await delegationRepository.save(delegation);

        deleteEvents.push(delegation.id);
        remaining -= delegation.value;
      }
    });

    for (const deleteEvent of deleteEvents) {
      this.eventEmitter.emit(
        DELEGATION_DELETED_EVENT,
        new DelegationDeletedEvent(deleteEvent),
      );
      console.log(new DelegationDeletedEvent(deleteEvent));
    }

    for (const createEvent of createEvents) {
      this.eventEmitter.emit(
        DELEGATION_CREATED_EVENT,
        new DelegationCreatedEvent(createEvent),
      );
      console.log(new DelegationCreatedEvent(createEvent));
    }
  }

  private async getDelegationNonce(
    user: number,
    address: string,
    nodeId: number,
  ): Promise<string> {
    const node = await this.nodeRepository.findOneOrFail({
      id: nodeId,
      type: NodeType.MAINNET,
    });
    const nonce = await this.delegationNonceRepository.findOneOrFail({
      user,
      address,
      node,
    });

    return `Delegate to ${nonce.node.address}, from ${nonce.address} with nonce #${nonce.value}`;
  }

  private async getUndelegationNonce(
    user: number,
    address: string,
    nodeId: number,
  ): Promise<string> {
    const node = await this.nodeRepository.findOneOrFail({
      id: nodeId,
      type: NodeType.MAINNET,
    });
    const nonce = await this.delegationNonceRepository.findOneOrFail({
      user,
      address,
      node,
    });

    return `Undelegate from ${nonce.node.address}, using ${nonce.address} with nonce #${nonce.value}`;
  }

  private async createNonce(
    user: number,
    address: string,
    nodeId: number,
  ): Promise<void> {
    const node = await this.nodeRepository.findOneOrFail({
      id: nodeId,
      type: NodeType.MAINNET,
    });

    const nonceExists = await this.delegationNonceRepository.findOne({
      user,
      address,
      node,
    });

    if (!nonceExists) {
      const nonce = new DelegationNonce();
      nonce.user = user;
      nonce.address = address;
      nonce.node = node;
      nonce.value = 1;
      await this.delegationNonceRepository.save(nonce);
    }
  }

  private async incrementNonce(
    user: number,
    address: string,
    nodeId: number,
  ): Promise<void> {
    const node = await this.nodeRepository.findOneOrFail({
      id: nodeId,
      type: NodeType.MAINNET,
    });

    const nonce = await this.delegationNonceRepository.findOneOrFail({
      user,
      address,
      node,
    });

    nonce.value = nonce.value + 1;
    await this.delegationNonceRepository.save(nonce);
  }

  private async getTotalNodeDelegation(nodeId: number) {
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
      .where('LOWER("d"."address") = LOWER(:address)', { address })
      .getRawOne();
    return parseInt(d.total, 10) || 0;
  }

  private async getUserDelegationsToNode(address: string, node: number) {
    const d = await this.delegationRepository
      .createQueryBuilder('d')
      .select('SUM("d"."value")', 'total')
      .where('LOWER("d"."address") = LOWER(:address)', { address })
      .andWhere('"d"."nodeId" = :node', { node })
      .getRawOne();
    return parseInt(d.total, 10) || 0;
  }

  private async getUserUndelegatableDelegationsToNode(
    address: string,
    node: number,
  ) {
    const d = await this.delegationRepository
      .createQueryBuilder('d')
      .select('SUM("d"."value")', 'total')
      .where('LOWER("d"."address") = LOWER(:address)', { address })
      .andWhere('"d"."nodeId" = :node', { node })
      .andWhere('"d"."createdAt" < :date', {
        date: moment().utc().subtract(5, 'days').utc().toDate(),
      })
      .getRawOne();
    return parseInt(d.total, 10) || 0;
  }

  private async registerUndelegation(
    nodeId: number,
    address: string,
    amount: BigNumber,
  ) {
    const node = await this.nodeRepository.findOneOrFail({
      where: { id: nodeId },
      withDeleted: true,
    });
    const undelegation = this.undelegationRepository.create();
    undelegation.address = address;
    undelegation.chain = node.type as NodeType;
    undelegation.node = node;
    undelegation.value = amount.toString();
    const savedUndelegation = await this.undelegationRepository.save(
      undelegation,
    );
    if (!savedUndelegation) {
      throw new Error(
        `Could not save undelegation for ${address} with value ${amount} from node ${nodeId}`,
      );
    }
  }

  public async undelegateFromChain(undelegation: Undelegation) {
    let undelegationBlockNumber: number;

    if (undelegation.chain === NodeType.TESTNET) {
      undelegationBlockNumber = await this.testnetBlockchainService.undelegate(
        undelegation.address,
        BigNumber.from(undelegation.value),
      );
    }

    if (undelegation.chain === NodeType.MAINNET) {
      undelegationBlockNumber = await this.mainnetBlockchainService.undelegate(
        undelegation.address,
        BigNumber.from(undelegation.value),
      );
    }

    undelegation.creationBlock = undelegationBlockNumber;
    undelegation.confirmationBlock =
      undelegationBlockNumber + this.undelegationBlockDelay;
    undelegation.triggered = true;
    const savedUndelegation = await this.undelegationRepository.save(
      undelegation,
    );
    if (!savedUndelegation) {
      throw new Error(
        `Could not call undelegation for ${undelegation.address} with value ${undelegation.value} from node ${undelegation.node.id} on ${undelegation.chain}`,
      );
    }
  }

  public async confirmUndelegation(undelegation: Undelegation) {
    if (undelegation.chain === NodeType.MAINNET) {
      await this.mainnetBlockchainService.confirmUndelegate(
        undelegation.address,
      );
    } else if (undelegation.chain === NodeType.TESTNET) {
      await this.testnetBlockchainService.confirmUndelegate(
        undelegation.address,
      );
    }

    undelegation.confirmed = true;
    const saved = await this.undelegationRepository.save(undelegation);
    if (!saved) {
      throw new Error(
        `Could not update undelegation ${undelegation.id} in the database.`,
      );
    }
  }
}
