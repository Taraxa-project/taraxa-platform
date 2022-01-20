import { Queue } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { NodeService } from '../node/node.service';
import { ENSURE_DELEGATION_JOB } from './delegation.constants';
import { EnsureDelegationJob } from './job/ensure-delegation.job';
import { DelegationService } from './delegation.service';

@Injectable()
export class DelegationTaskService {
  private readonly logger = new Logger(DelegationTaskService.name);

  constructor(
    private nodeService: NodeService,
    @InjectQueue('delegation')
    private delegationQueue: Queue,
    private delegationService: DelegationService,
  ) {}

  @Cron('0 0 * * *')
  async ensureDelegation() {
    this.logger.debug('Starting delegation worker...');
    const nodes = await this.nodeService.findNodes({});

    for (const node of nodes) {
      await this.delegationQueue.add(
        ENSURE_DELEGATION_JOB,
        new EnsureDelegationJob(node.id, node.type, node.address),
      );
    }
  }

  @Cron('0 0 * * *')
  async rebalanceTestnet() {
    this.logger.debug('Starting testnet rebalancing worker...');
    await this.delegationService.rebalanceTestnet();
  }
}
