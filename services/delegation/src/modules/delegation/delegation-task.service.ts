import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Node } from '../node/node.entity';
import { DelegationService } from './delegation.service';
import { ENSURE_DELEGATION_JOB } from './delegation.constants';
import { EnsureDelegationJob } from './job/ensure-delegation.job';

@Injectable()
export class DelegationTaskService implements OnModuleInit {
  private readonly logger = new Logger(DelegationTaskService.name);

  constructor(
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
    @InjectQueue('delegation')
    private delegationQueue: Queue,
    private delegationService: DelegationService,
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
}
