import { Queue } from 'bull';
import { LessThan, Repository } from 'typeorm';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Node } from '../node/node.entity';
import { DelegationService } from './delegation.service';
import { ENSURE_DELEGATION_JOB } from './delegation.constants';
import { EnsureDelegationJob } from './job/ensure-delegation.job';
import {
  BLOCKCHAIN_TESTNET_INSTANCE_TOKEN,
  BLOCKCHAIN_MAINNET_INSTANCE_TOKEN,
} from '../blockchain/blockchain.constant';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Undelegation } from './undelegation.entity';
import { NodeType } from '../node/node-type.enum';

@Injectable()
export class DelegationTaskService implements OnModuleInit {
  private readonly logger = new Logger(DelegationTaskService.name);

  constructor(
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
    @InjectRepository(Undelegation)
    private undelegationRepository: Repository<Undelegation>,
    @InjectQueue('delegation')
    private delegationQueue: Queue,
    private delegationService: DelegationService,
    @Inject(BLOCKCHAIN_TESTNET_INSTANCE_TOKEN)
    private testnetBlockchainService: BlockchainService,
    @Inject(BLOCKCHAIN_MAINNET_INSTANCE_TOKEN)
    private mainnetBlockchainService: BlockchainService,
  ) {}
  onModuleInit() {
    this.logger.debug(`Init ${DelegationTaskService.name} cron`);
  }

  @Cron('0 0 * * *')
  async ensureDelegation() {
    this.logger.debug('Starting delegation worker...');
    const nodes = await this.nodeRepository.find({ type: 'mainnet' });

    for (const node of nodes) {
      await this.delegationQueue.add(
        ENSURE_DELEGATION_JOB,
        new EnsureDelegationJob(node.id, node.type, node.address),
      );
    }
  }

  @Cron('0 0 * * *')
  async rebalanceStaking() {
    this.logger.debug('Starting rebalance staking worker...');

    const delegators = await this.delegationService.getDelegators();
    for (const delegator of delegators) {
      const { address } = delegator;
      const balances = await this.delegationService.getBalances(address);

      if (balances.delegated > balances.total) {
        const diff = balances.delegated - balances.total;
        await this.delegationService.undelegate(address, diff);
      }
    }
  }

  @Cron('*/10 * * * *')
  async confirmUndelegation() {
    this.logger.debug('Starting undelegation confirmation worker...');
    const currentTestnetBlock =
      await this.testnetBlockchainService.getCurrentBlockNumber();
    const currentMainnetBlock =
      await this.mainnetBlockchainService.getCurrentBlockNumber();
    if (currentMainnetBlock && currentTestnetBlock) {
      const testnetUndelegationsInScope =
        await this.undelegationRepository.find({
          where: {
            confirmationBlock: LessThan(currentTestnetBlock),
            chain: NodeType.TESTNET,
          },
        });
      const mainnetnetUndelegationsInScope =
        await this.undelegationRepository.find({
          where: {
            confirmationBlock: LessThan(currentTestnetBlock),
            chain: NodeType.MAINNET,
          },
        });
      const undelegationsInScope = testnetUndelegationsInScope.concat(
        mainnetnetUndelegationsInScope,
      );
      for (const undelegation of undelegationsInScope) {
        await this.delegationService.confirmUndelegation(undelegation);
        this.logger.log(
          `Confirmed undelegation for validator ${undelegation.address}`,
        );
      }
    }
  }
}
