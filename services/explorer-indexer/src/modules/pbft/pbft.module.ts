import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PbftEntity, TransactionEntity } from '@taraxa_project/explorer-shared';
import { Queues } from 'src/types';
import { ConnectorsModule } from '../connectors';
import { DagModule } from '../dag';
import { TransactionModule } from '../transaction';
import { PbftConsumer } from './pbft.consumer';
import PbftService from './pbft.service';
import * as dotenv from 'dotenv';

dotenv.config();
const isProducer = process.env.ENABLE_PRODUCER_MODULE === 'true';
@Module({
  imports: [
    forwardRef(() => TransactionModule),
    forwardRef(() => DagModule),
    TypeOrmModule.forFeature([PbftEntity, TransactionEntity]),
    ConnectorsModule,
    BullModule.registerQueue(
      {
        name: Queues.NEW_PBFTS,
      },
      {
        name: Queues.NEW_DAGS,
      },
      {
        name: Queues.STALE_TRANSACIONS,
      }
    ),
  ],
  providers: isProducer ? [PbftService] : [PbftService, PbftConsumer],
  controllers: [],
  exports: [PbftService],
})
export class PbftModule {}
