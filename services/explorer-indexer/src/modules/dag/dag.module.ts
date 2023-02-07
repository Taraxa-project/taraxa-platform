import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DagEntity, TransactionEntity } from '@taraxa_project/explorer-shared';
import { Queues } from 'src/types';
import { ConnectorsModule } from '../connectors';
import { TransactionModule } from '../transaction';
import { DagConsumer } from './dag.consumer';
import DagService from './dag.service';
import * as dotenv from 'dotenv';

dotenv.config();
const isProducer = process.env.ENABLE_PRODUCER_MODULE === 'true';
const isTransactionConsumer =
  process.env.ENABLE_TRANSACTION_CONSUMER === 'true';
@Module({
  imports: [
    TransactionModule,
    TypeOrmModule.forFeature([DagEntity, TransactionEntity]),
    ConnectorsModule,
    BullModule.registerQueue({
      name: Queues.NEW_DAGS,
    }),
  ],
  providers: isProducer
    ? [DagService]
    : isTransactionConsumer
    ? [DagService]
    : [DagService, DagConsumer],
  controllers: [],
  exports: [DagService],
})
export class DagModule {}
