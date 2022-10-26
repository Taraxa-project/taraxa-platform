import { Job, Queue } from 'bull';
import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { Processor, Process, InjectQueue } from '@nestjs/bull';
import PbftService from './pbft.service';
import { IGQLPBFT, QueueJobs } from '../../types';
import { GraphQLConnectorService } from '../connectors';
import { IPBFT, ITransaction } from '@taraxa_project/explorer-shared';
import { BigInteger } from 'jsbn';

@Injectable()
@Processor({ name: 'new_pbfts', scope: Scope.REQUEST })
export class PbftConsumer implements OnModuleInit {
  private readonly logger = new Logger(PbftConsumer.name);
  constructor(
    private pbftService: PbftService,
    private readonly graphQLConnector: GraphQLConnectorService,
    @InjectQueue('new_dags')
    private readonly dagsQueue: Queue
  ) {}
  onModuleInit() {
    this.logger.debug(`Init ${PbftConsumer.name} worker`);
  }
  @Process(QueueJobs.NEW_PBFT_BLOCKS)
  async savePbft(job: Job<{ pbftPeriod: number }>) {
    this.logger.debug(
      `Handling ${QueueJobs.NEW_PBFT_BLOCKS} for job ${
        job.id
      }, data: ${JSON.stringify(job.data, null, 2)}`
    );

    const { pbftPeriod } = job.data;
    const newBlock: IGQLPBFT =
      await this.graphQLConnector.getPBFTBlockForNumber(pbftPeriod);

    if (newBlock && newBlock.number) {
      const formattedBlock: IPBFT = this.pbftService.pbftGQLToIPBFT(newBlock);
      this.logger.debug(
        `${QueueJobs.NEW_PBFT_BLOCKS} worker (job ${job.id}): Saving PBFT ${job.data}`
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
      this.dagsQueue.add(QueueJobs.NEW_DAG_BLOCKS, {
        pbftPeriod: savedPbft.number,
      });
    }
  }
}
