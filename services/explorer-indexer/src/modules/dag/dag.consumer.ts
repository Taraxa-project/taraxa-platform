import { Job, Queue } from 'bull';
import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import {
  Processor,
  Process,
  OnQueueError,
  OnQueueStalled,
  InjectQueue,
} from '@nestjs/bull';
import {
  QueueData,
  IGQLDag,
  QueueJobs,
  Queues,
  JobKeepAliveConfiguration,
  SyncTypes,
  TxQueueData,
} from '../../types';
import { GraphQLConnectorService } from '../connectors';
import DagService from './dag.service';
import { DagEntity } from '@taraxa_project/explorer-shared';

@Injectable()
@Processor({ name: Queues.NEW_DAGS, scope: Scope.REQUEST })
export class DagConsumer implements OnModuleInit {
  private readonly logger = new Logger(DagConsumer.name);
  constructor(
    private dagService: DagService,
    private readonly graphQLConnector: GraphQLConnectorService,
    @InjectQueue(Queues.NEW_DAGS)
    private readonly dagsQueue: Queue,
    @InjectQueue(Queues.STALE_TRANSACTIONS)
    private readonly txQueue: Queue
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
    const { pbftPeriod, type } = job.data;
    try {
      const dags: IGQLDag[] =
        await this.graphQLConnector.getDagBlocksForPbftPeriod(pbftPeriod);
      if (dags && dags?.length > 0) {
        this.logger.debug(
          `${QueueJobs.NEW_DAG_BLOCKS} worker (job ${job.id}): Saving ${dags?.length} DAGs for period ${pbftPeriod}`
        );
        for (const dag of dags) {
          const formattedDag = this.dagService.dagGraphQlToIdag(dag);
          const saved = await this.dagService.safeSaveDag(formattedDag);
          await this.handleTransactions(saved, type);
          if (!saved) {
            await pushPeriodBackToQueue(
              pbftPeriod,
              this.dagsQueue,
              this.logger
            );
          }
        }
      }

      await job.progress(100);
    } catch (error) {
      await pushPeriodBackToQueue(pbftPeriod, this.dagsQueue, this.logger);
    }
  }
  async handleTransactions(dag: DagEntity, syncType: SyncTypes) {
    if (!dag.transactions || dag.transactions?.length === 0) return;
    const staleTxes = dag.transactions.filter((t) => !t.status || !t.value);
    const staleCount = staleTxes?.length;
    if (staleCount) {
      for (const transaction of staleTxes) {
        try {
          if (transaction && transaction.hash) {
            const done = await this.txQueue.add(
              QueueJobs.NEW_TRANSACTIONS,
              {
                hash: transaction.hash,
                type: syncType,
              } as TxQueueData,
              JobKeepAliveConfiguration
            );
            if (!done) {
              this.logger.error(
                `Pushing stale transaction ${transaction.hash} into ${this.txQueue.name} queue failed.`
              );
            }
          }
        } catch (error) {
          this.logger.error(
            `Pushing into ${this.txQueue.name} ran into an error: ${error}`
          );
        }
      }
    }
  }
}

async function pushPeriodBackToQueue(
  pbftPeriod: number,
  queue: Queue,
  logger: Logger
) {
  const added = await queue.add(
    QueueJobs.NEW_DAG_BLOCKS,
    {
      pbftPeriod,
    },
    JobKeepAliveConfiguration
  );
  if (added) {
    logger.log(`Pushed ${pbftPeriod} back to ${queue.name}`);
  }
}
