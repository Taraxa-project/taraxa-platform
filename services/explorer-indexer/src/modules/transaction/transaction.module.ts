import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PbftEntity, TransactionEntity } from '@taraxa_project/explorer-shared';
import { PbftModule } from '../pbft';
import { TransactionConsumer } from './transaction.consumer';
import TransactionService from './transaction.service';
import * as dotenv from 'dotenv';
import { ConnectorsModule } from '../connectors';
import { Queues } from 'src/types';
import { BullModule } from '@nestjs/bull';

dotenv.config();
const isProducer = process.env.ENABLE_PRODUCER_MODULE === 'true';
const isTransactionConsumer =
  process.env.ENABLE_TRANSACTION_CONSUMER === 'true';
@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, PbftEntity]),
    BullModule.registerQueue({
      name: Queues.STALE_TRANSACTIONS,
    }),
    forwardRef(() => PbftModule),
    ConnectorsModule,
  ],
  providers: isProducer
    ? [TransactionService]
    : isTransactionConsumer
    ? [TransactionService, TransactionConsumer]
    : [TransactionService],
  controllers: [],
  exports: [TransactionService],
})
export class TransactionModule {}
