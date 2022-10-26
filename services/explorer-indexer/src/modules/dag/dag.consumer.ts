import { Job, Queue } from 'bull';
import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { Processor, Process, OnQueueError } from '@nestjs/bull';
import { DagQueueData, IGQLDag, QueueJobs } from '../../types';
import { GraphQLConnectorService } from '../connectors';
import DagService from './dag.service';

@Injectable()
@Processor({ name: 'new_dags', scope: Scope.REQUEST })
export class DagConsumer implements OnModuleInit {
  private readonly logger = new Logger(DagConsumer.name);
  constructor(
    private dagService: DagService,
    private readonly graphQLConnector: GraphQLConnectorService
  ) {}
  onModuleInit() {
    this.logger.debug(`Init ${DagConsumer.name} worker`);
  }

  @OnQueueError({ name: 'new_dags' })
  async handleQueueErrors(error: Error) {
    this.logger.error('DAG queue ran into an error: ', error);
    this.dagService.setRedisConnectionState(false);
  }

  @Process(QueueJobs.NEW_DAG_BLOCKS)
  async saveDag(job: Job<DagQueueData>) {
    this.logger.debug(
      `Starting ${QueueJobs.NEW_DAG_BLOCKS} worker for job ${
        job.id
      }, data: ${JSON.stringify(job.data, null, 2)}`
    );

    const { pbftPeriod } = job.data;

    const dags: IGQLDag[] =
      await this.graphQLConnector.getDagBlocksForPbftPeriod(pbftPeriod);
    if (dags && dags?.length > 0) {
      this.logger.debug(
        `${QueueJobs.NEW_DAG_BLOCKS} worker (job ${job.id}): Saving DAGs number ${dags?.length}`
      );
      for (const dag of dags) {
        const formattedDag = this.dagService.dagGraphQlToIdag(dag);
        await this.dagService.safeSaveDag(formattedDag);
      }
    }
  }
}
