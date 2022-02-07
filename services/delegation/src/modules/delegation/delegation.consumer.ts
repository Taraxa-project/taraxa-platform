import { Job } from 'bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { ENSURE_DELEGATION_JOB } from './delegation.constants';
import { DelegationService } from './delegation.service';
import { EnsureDelegationJob } from './job/ensure-delegation.job';

@Injectable()
@Processor('delegation')
export class DelegationConsumer implements OnModuleInit {
  private readonly logger = new Logger(DelegationConsumer.name);
  constructor(private delegationService: DelegationService) {}
  onModuleInit() {
    this.logger.debug(`Init ${DelegationConsumer.name} worker`);
  }
  @Process(ENSURE_DELEGATION_JOB)
  async ensureDelegation(job: Job<EnsureDelegationJob>) {
    this.logger.debug(
      `Starting ${ENSURE_DELEGATION_JOB} worker for job ${
        job.id
      }, data: ${JSON.stringify(job.data, null, 2)}`,
    );

    const { nodeId, type, address } = job.data;

    this.logger.debug(
      `${ENSURE_DELEGATION_JOB} worker (job ${job.id}): Ensuring node ${nodeId} has delegation`,
    );
    await this.delegationService.ensureDelegation(nodeId, type, address);
  }
}
