import { Job, Queue } from 'bull';
import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { Processor, Process, InjectQueue, OnQueueError } from '@nestjs/bull';
import PbftService from './pbft.service';
import {
  IGQLPBFT,
  JobKeepAliveConfiguration,
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

        this.logger.debug(
          `${QueueJobs.NEW_PBFT_BLOCKS} worker (job ${job.id}): Saving PBFT ${job.data.pbftPeriod}`
        );

        await this.fillGenesisBlock(formattedBlock); // fills the genesis block

        const blockReward = calculateBlockReward(formattedBlock); // calculates the block reward
        formattedBlock.reward = blockReward.toString();

        const savedPbft = await this.pbftService.safeSavePbft(formattedBlock);

        this.logger.debug(
          `Saved new PBFT with ID ${savedPbft.id} for period ${savedPbft.number}`
        );
        await this.handleTransactions(savedPbft, type);

        await this.dagsQueue.add(
          QueueJobs.NEW_DAG_BLOCKS,
          {
            pbftPeriod: savedPbft.number,
          },
          JobKeepAliveConfiguration
        );
        this.logger.log(`Pushed ${pbftPeriod} into DAG sync queue`);
      }
      await job.progress(100);
    } catch (error) {
      this.logger.error(
        `An error occurred during processing PBFT for period ${pbftPeriod}. Reason: `,
        error
      );
      await job.moveToFailed({
        message: `Processing ${job.id} failed. Reason: ${error}`,
      });
    }
  }

  async handleTransactions(pbft: PbftEntity, syncType: SyncTypes) {
    if (!pbft.transactions || pbft.transactions?.length === 0) return;
    const staleTxes = pbft.transactions.filter((t) => !t.status || !t.value);
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

  async fillGenesisBlock(block: IPBFT) {
    if (block.number === 0) {
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
            block
          )
        );
      }
      block.transactions = genesisTransactions;
      this.logger.warn(
        `Pushed ${block.transactions.length} genesis transactions into GENESIS block ${block.number}`
      );
    }
  }
}

function calculateBlockReward(formattedBlock: IPBFT) {
  let blockReward = new BigInteger('0', 10);
  formattedBlock.transactions?.forEach((tx: ITransaction) => {
    const gasUsed = new BigInteger(tx.gasUsed?.toString() || '0');
    tx.gasUsed = gasUsed.toString();
    const gasPrice = new BigInteger(tx.gasPrice?.toString() || '0');
    tx.gasPrice = gasPrice.toString();
    const reward = gasUsed.multiply(gasPrice);
    const newVal = blockReward.add(reward);
    blockReward = newVal;
  });
  return blockReward;
}
