import { Job, Queue } from 'bull';
import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { Processor, Process, InjectQueue, OnQueueError } from '@nestjs/bull';
import PbftService from './pbft.service';
import { IGQLPBFT, QueueData, QueueJobs, Queues, SyncTypes } from '../../types';
import { GraphQLConnectorService } from '../connectors';
import { IPBFT, ITransaction } from '@taraxa_project/explorer-shared';
import { BigInteger } from 'jsbn';

@Injectable()
@Processor({ name: Queues.NEW_PBFTS, scope: Scope.REQUEST })
export class PbftConsumer implements OnModuleInit {
  private readonly logger = new Logger(PbftConsumer.name);
  constructor(
    private pbftService: PbftService,
    private readonly graphQLConnector: GraphQLConnectorService,
    @InjectQueue(Queues.NEW_DAGS)
    private readonly dagsQueue: Queue,
    @InjectQueue(Queues.NEW_PBFTS)
    private readonly pbftsQueue: Queue
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
    if (pbftPeriod == 0) {
      console.log('Were at zero');
    }
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
        this.dagsQueue.add(QueueJobs.NEW_DAG_BLOCKS, {
          pbftPeriod: savedPbft.number,
        });
      }
      await job.progress(100);
    } catch (error) {
      this.logger.error(
        `An error occurred during saving PBFT ${pbftPeriod}. Putting it back to queue: `,
        error
      );
      this.pbftsQueue.add(QueueJobs.NEW_PBFT_BLOCKS, {
        pbftPeriod,
        type,
      } as QueueData);
      await job.progress(100);
    }
  }
}
