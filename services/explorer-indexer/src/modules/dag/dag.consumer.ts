import { Job, Queue } from 'bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { DagQueueData, IGQLDag, QueueJobs } from '../../types';
import { GraphQLConnectorService } from '../connectors';
import DagService from './dag.service';

@Injectable()
@Processor('dag')
export class DagConsumer implements OnModuleInit {
  private readonly logger = new Logger(DagConsumer.name);
  constructor(
    private dagService: DagService,
    private readonly graphQLConnector: GraphQLConnectorService,
    @InjectQueue('new_transactions')
    private readonly txQueue: Queue
  ) {}
  onModuleInit() {
    this.logger.debug(`Init ${DagConsumer.name} worker`);
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
