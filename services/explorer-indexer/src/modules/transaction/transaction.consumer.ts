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
import { ITransaction } from '@taraxa_project/explorer-shared';
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

  @Process(QueueJobs.STALE_TRANSACTIONS)
  async saveStaleTransactions(job: Job<TxQueueData>) {
    this.logger.debug(
      `Handling ${QueueJobs.STALE_TRANSACTIONS} for job ${job.id}, saving Transaction: ${job.data.hash}`
    );

    const { hash, type } = job.data;
    const newTx: ITransactionWithData =
      await this.graphQLConnector.getTransactionByHash(hash);
    try {
      if (newTx && newTx.hash && newTx.index && newTx.nonce) {
        const formattedTx: ITransaction =
          this.txService.gQLToITransaction(newTx);
        this.logger.debug(
          `${QueueJobs.STALE_TRANSACTIONS} worker (job ${job.id}): Saving Transaction ${job.data.hash}`
        );
        const block = await this.pbftService.getBlockByHash(
          formattedTx.block?.hash
        );
        if (block) {
          const blockReward = new BigInteger(block.reward || '0', 10);
          const gasUsed = new BigInteger(formattedTx.gasUsed.toString() || '0');
          const gasPrice = new BigInteger(
            formattedTx.gasPrice.toString() || '0'
          );
          const txReward = gasUsed.multiply(gasPrice);
          block.reward = blockReward.add(txReward).toString();
          const savedTx = await this.txService.updateTransaction(formattedTx);
          this.logger.debug(`Updated Transactions ${savedTx.hash}`);
          const savedPbft = await this.pbftService.safeSavePbft(block);
          this.logger.debug(
            `Updated PBFT rewards for ${savedPbft.hash} in period ${savedPbft.number}`
          );
        }
      } else {
        const done = await this.txQueue.add(QueueJobs.STALE_TRANSACTIONS, {
          hash,
          type,
        } as TxQueueData);
        if (done) {
          this.logger.log(
            `Pushed stale transaction ${hash} into ${this.txQueue.name} queue`
          );
        }
      }
      await job.progress(100);
    } catch (error) {
      this.logger.error(
        `An error occurred during saving Transaction ${hash}: `,
        error
      );
      const done = await this.txQueue.add(QueueJobs.STALE_TRANSACTIONS, {
        hash,
        type,
      } as TxQueueData);
      if (done) {
        this.logger.log(
          `Pushed stale transaction ${hash} into ${this.txQueue.name} queue`
        );
      }
      await job.progress(100);
    }
  }
}
