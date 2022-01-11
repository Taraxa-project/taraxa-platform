import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { ENSURE_DELEGATION_JOB } from './delegation.constants';
import { EnsureDelegationJob } from './jobs/ensure-delegation.job';

@Injectable()
@Processor('delegation')
export class DelegationConsumer {
  private readonly logger = new Logger(DelegationConsumer.name);
  @Process(ENSURE_DELEGATION_JOB)
  async ensureDelegation(job: Job<EnsureDelegationJob>) {
    this.logger.debug(
      `Starting ${ENSURE_DELEGATION_JOB} worker for job ${
        job.id
      }, data: ${JSON.stringify(job.data, null, 2)}`,
    );
  }
}
