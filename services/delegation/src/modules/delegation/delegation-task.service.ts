import { Queue } from 'bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { NodeService } from '../node/node.service';
import { ENSURE_DELEGATION_JOB } from './delegation.constants';
import { EnsureDelegationJob } from './job/ensure-delegation.job';
import { DelegationService } from './delegation.service';

@Injectable()
export class DelegationTaskService implements OnModuleInit {
  private readonly logger = new Logger(DelegationTaskService.name);

  constructor(
    private nodeService: NodeService,
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
    const nodes = await this.nodeService.findNodes({ type: 'mainnet' });

    for (const node of nodes) {
      await this.delegationQueue.add(
        ENSURE_DELEGATION_JOB,
        new EnsureDelegationJob(node.id, node.type, node.address),
      );
    }
  }
}
