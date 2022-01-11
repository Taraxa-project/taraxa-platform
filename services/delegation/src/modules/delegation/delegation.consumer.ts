import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { NodeService } from '../node/node.service';
import { NodeType } from '../node/node-type.enum';
import { ENSURE_DELEGATION_JOB } from './delegation.constants';
import { DelegationService } from './delegation.service';
import { EnsureDelegationJob } from './job/ensure-delegation.job';

@Injectable()
@Processor('delegation')
export class DelegationConsumer {
  private readonly logger = new Logger(DelegationConsumer.name);
  constructor(
    private nodeService: NodeService,
    private delegationService: DelegationService,
  ) {}
  @Process(ENSURE_DELEGATION_JOB)
  async ensureDelegation(job: Job<EnsureDelegationJob>) {
    this.logger.debug(
      `Starting ${ENSURE_DELEGATION_JOB} worker for job ${
        job.id
      }, data: ${JSON.stringify(job.data, null, 2)}`,
    );

    const node = await this.nodeService.findNodeByOrFail({
      id: job.data.nodeId,
    });

    this.logger.debug(
      `${ENSURE_DELEGATION_JOB} worker (job ${job.id}): Ensuring node ${node.id} has delegation`,
    );
    if (node.type === NodeType.MAINNET) {
      await this.delegationService.ensureMainnetDelegation(node.id);
    } else {
      await this.delegationService.ensureTestnetDelegation(node.id);
    }
  }
}
