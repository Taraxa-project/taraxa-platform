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
import { ConfigModule } from '@nestjs/config';

dotenv.config();
const isProducer = process.env.ENABLE_PRODUCER_MODULE === 'true';
const isTransactionConsumer =
  process.env.ENABLE_TRANSACTION_CONSUMER === 'true';
@Module({
  imports: [
    forwardRef(() => TransactionModule),
    forwardRef(() => DagModule),
    TypeOrmModule.forFeature([PbftEntity, TransactionEntity]),
    ConnectorsModule,
    ConfigModule,
    BullModule.registerQueue(
      {
        name: Queues.NEW_PBFTS,
      },
      {
        name: Queues.NEW_DAGS,
      },
      {
        name: Queues.STALE_TRANSACTIONS,
      }
    ),
  ],
  providers: isProducer
    ? [PbftService]
    : isTransactionConsumer
    ? [PbftService]
    : [PbftService, PbftConsumer],
  controllers: [],
  exports: [PbftService],
})
export class PbftModule {}
