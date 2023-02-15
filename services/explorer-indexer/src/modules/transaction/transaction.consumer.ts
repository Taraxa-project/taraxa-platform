import { Job, Queue } from 'bull';
import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { Processor, Process, InjectQueue, OnQueueError } from '@nestjs/bull';
import {
  ITransactionWithData,
  QueueJobs,
  Queues,
  TxQueueData,
} from '../../types';
import { GraphQLConnectorService } from '../connectors';
import { ITransaction, zeroX } from '@taraxa_project/explorer-shared';
import { BigInteger } from 'jsbn';
import TransactionService from '../transaction/transaction.service';
import PbftService from '../pbft/pbft.service';

@Injectable()
@Processor({ name: Queues.STALE_TRANSACTIONS, scope: Scope.REQUEST })
export class TransactionConsumer implements OnModuleInit {
  private readonly logger = new Logger(TransactionConsumer.name);

  constructor(
    private txService: TransactionService,
    private pbftService: PbftService,
    private readonly graphQLConnector: GraphQLConnectorService,
    @InjectQueue(Queues.STALE_TRANSACTIONS)
    private readonly txQueue: Queue
  ) {}
  onModuleInit() {
    this.logger.debug(`Init ${TransactionConsumer.name} worker`);
  }

  @OnQueueError({ name: Queues.STALE_TRANSACTIONS })
  async handleQueueErrors(error: Error) {
    this.logger.error(`${this.txQueue.name} queue ran into an error: `, error);
    this.txService.setRedisConnectionState(false);
  }

  @Process(QueueJobs.NEW_TRANSACTIONS)
  async saveStaleTransactions(job: Job<TxQueueData>) {
    const { hash } = job.data;
    const timeStart = new Date().getTime();
    const newTx: ITransactionWithData =
      await this.graphQLConnector.getTransactionByHash(hash);
    const timeFetch = new Date().getTime();
    this.logger.log(`Fetch time for tx is ${timeFetch - timeStart} ms`);
    try {
      if (newTx && newTx.hash && newTx.nonce && newTx.value) {
        const formattedTx: ITransaction =
          this.txService.gQLToITransaction(newTx);
        this.logger.debug(
          `${QueueJobs.NEW_TRANSACTIONS} worker (job ${job.id}): Saving Transaction ${job.data.hash}`
        );
        const block = await this.pbftService.getBlockByHash(
          formattedTx.blockHash
        );
        if (block) {
          formattedTx.block = block;
          formattedTx.blockHash = block.hash;
          formattedTx.blockNumber = block.number;
          formattedTx.blockTimestamp = block.timestamp;
          const timeDbStart = new Date().getTime();
          const saved = await this.txService.updateTransaction(formattedTx);
          const timeDbEnd = new Date().getTime();
          this.logger.log(
            `Execution time for db insertion tx is ${
              timeDbEnd - timeDbStart
            } ms`
          );
          if (saved) {
            const timeEnd = new Date().getTime();
            await job.progress(100);
            this.logger.log(
              `Execution time for one tx is ${timeEnd - timeStart} ms`
            );
          }
        }
      } else {
        await job.moveToFailed({
          message: `Incomplete job data for transaction ${hash}`,
        });
      }
    } catch (error) {
      this.logger.error(
        `An error occurred during saving Transaction ${hash}: `,
        error
      );
      await job.moveToFailed({
        message: `An error occurred during saving Transaction ${hash}: ${error}`,
      });
    }
  }
}
