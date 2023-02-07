import { Job } from 'bull';
import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { Processor, Process, OnQueueError, OnQueueStalled } from '@nestjs/bull';
import { QueueData, IGQLDag, QueueJobs, Queues } from '../../types';
import { GraphQLConnectorService } from '../connectors';
import DagService from './dag.service';

@Injectable()
@Processor({ name: Queues.NEW_DAGS, scope: Scope.REQUEST })
export class DagConsumer implements OnModuleInit {
  private readonly logger = new Logger(DagConsumer.name);
  constructor(
    private dagService: DagService,
    private readonly graphQLConnector: GraphQLConnectorService
  ) {}
  onModuleInit() {
    this.logger.debug(`Init ${DagConsumer.name} worker`);
  }

  @OnQueueStalled({ name: Queues.NEW_DAGS })
  async handleQueueStalled(error: Error) {
    this.logger.debug('DAG queue stalled: ', error);
  }

  @OnQueueError({ name: Queues.NEW_DAGS })
  async handleQueueErrors(error: Error) {
    this.logger.error('DAG queue ran into an error: ', error);
    this.dagService.setRedisConnectionState(false);
  }

  @Process(QueueJobs.NEW_DAG_BLOCKS)
  async saveDag(job: Job<QueueData>) {
    const { pbftPeriod } = job.data;

    const dags: IGQLDag[] =
      await this.graphQLConnector.getDagBlocksForPbftPeriod(pbftPeriod);
    if (dags && dags?.length > 0) {
      this.logger.debug(
        `${QueueJobs.NEW_DAG_BLOCKS} worker (job ${job.id}): Saving ${dags?.length} DAGs for period ${pbftPeriod}`
      );
      for (const dag of dags) {
        const formattedDag = this.dagService.dagGraphQlToIdag(dag);
        await this.dagService.safeSaveDag(formattedDag);
      }
    }

    await job.progress(100);
  }
}
