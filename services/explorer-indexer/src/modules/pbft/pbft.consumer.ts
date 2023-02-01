import { Job, Queue } from 'bull';
import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { Processor, Process, InjectQueue, OnQueueError } from '@nestjs/bull';
import PbftService from './pbft.service';
import {
  IGQLPBFT,
  QueueData,
  QueueJobs,
  Queues,
  SyncTypes,
  TxQueueData,
} from '../../types';
import { GraphQLConnectorService, RPCConnectorService } from '../connectors';
import {
  IPBFT,
  ITransaction,
  PbftEntity,
} from '@taraxa_project/explorer-shared';
import { BigInteger } from 'jsbn';
import TransactionService from '../transaction/transaction.service';

@Injectable()
@Processor({ name: Queues.NEW_PBFTS, scope: Scope.REQUEST })
export class PbftConsumer implements OnModuleInit {
  private readonly logger = new Logger(PbftConsumer.name);
  constructor(
    private pbftService: PbftService,
    private txService: TransactionService,
    private readonly graphQLConnector: GraphQLConnectorService,
    private readonly rpcConnector: RPCConnectorService,
    @InjectQueue(Queues.NEW_DAGS)
    private readonly dagsQueue: Queue,
    @InjectQueue(Queues.NEW_PBFTS)
    private readonly pbftsQueue: Queue,
    @InjectQueue(Queues.STALE_TRANSACTIONS)
    private readonly txQueue: Queue
  ) {}
  onModuleInit() {
    this.logger.debug(`Init ${PbftConsumer.name} worker`);
  }

  @OnQueueError({ name: Queues.NEW_PBFTS })
  async handleQueueErrors(error: Error) {
    this.logger.error('PBFT queue ran into an error: ', error);
    this.pbftService.setRedisConnectionState(false);
  }

  @Process(QueueJobs.NEW_PBFT_BLOCKS)
  async savePbft(job: Job<QueueData>) {
    this.logger.debug(
      `Handling ${QueueJobs.NEW_PBFT_BLOCKS} for job ${job.id}, saving PBFT for period: ${job.data.pbftPeriod}`
    );

    const { pbftPeriod, type } = job.data;
    const newBlock: IGQLPBFT =
      await this.graphQLConnector.getPBFTBlockForNumber(pbftPeriod);
    try {
      if (newBlock && newBlock.number != undefined) {
        const formattedBlock: IPBFT = this.pbftService.pbftGQLToIPBFT(newBlock);
        if (type === SyncTypes.LIVE) {
          await this.pbftService.checkAndDeletePbftsGreaterThanNumber(
            newBlock.number
          );
        }
        this.logger.debug(
          `${QueueJobs.NEW_PBFT_BLOCKS} worker (job ${job.id}): Saving PBFT ${job.data.pbftPeriod}`
        );
        if (pbftPeriod === 0) {
          const initialBalances = await this.rpcConnector.getConfig();
          const genesisTransactions = [];
          for (const key in initialBalances) {
            this.logger.warn(
              `Pushed ${initialBalances[key]} genesis transactions into GENESIS block ${key}`
            );
            genesisTransactions.push(
              this.txService.createSyntheticTransaction(
                key,
                initialBalances[key],
                formattedBlock
              )
            );
          }
          formattedBlock.transactions = genesisTransactions;
          this.logger.warn(
            `Pushed ${formattedBlock.transactions.length} genesis transactions into GENESIS block ${formattedBlock.number}`
          );
        }
        let blockReward = new BigInteger('0', 10);
        formattedBlock.transactions?.forEach((tx: ITransaction) => {
          const gasUsed = new BigInteger(tx.gasUsed.toString() || '0');
          tx.gasUsed = gasUsed.toString();
          const gasPrice = new BigInteger(tx.gasPrice.toString() || '0');
          tx.gasPrice = gasPrice.toString();
          const reward = gasUsed.multiply(gasPrice);
          const newVal = blockReward.add(reward);
          blockReward = newVal;
        });

        formattedBlock.reward = blockReward.toString();
        const savedPbft = await this.pbftService.safeSavePbft(formattedBlock);
        this.logger.debug(
          `Saved new PBFT with ID ${savedPbft.id} for period ${savedPbft.number}`
        );
        await this.handleStaleTransactions(savedPbft, type);
        this.dagsQueue.add(QueueJobs.NEW_DAG_BLOCKS, {
          pbftPeriod: savedPbft.number,
        });
        this.logger.log(`Pushed ${pbftPeriod} into DAG sync queue`);
      }
      await job.progress(100);
    } catch (error) {
      this.logger.error(
        `An error occurred during saving PBFT ${pbftPeriod}: `,
        error
      );
      this.pbftsQueue.add(QueueJobs.NEW_PBFT_BLOCKS, {
        pbftPeriod,
        type,
      } as QueueData);
      this.logger.warn(`Pushed ${pbftPeriod} back into PBFT sync queue`);
      await job.progress(100);
    }
  }

  async handleStaleTransactions(pbft: PbftEntity, syncType: SyncTypes) {
    if (!pbft.transactions || pbft.transactions?.length === 0) return;
    const staleTxes = pbft.transactions.filter((t) => !t.status || !t.value);
    const staleCount = staleTxes?.length;
    this.logger.debug(
      `${pbft.number} has ${staleCount} stale transactions. Iterating: `
    );
    if (staleCount) {
      for (const transaction of staleTxes) {
        try {
          if (transaction && transaction.hash) {
            const done = await this.txQueue.add(QueueJobs.STALE_TRANSACTIONS, {
              hash: transaction.hash,
              type: syncType,
            } as TxQueueData);
            if (done) {
              this.logger.log(
                `Pushed stale transaction ${transaction.hash} into ${this.txQueue.name} queue`
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
