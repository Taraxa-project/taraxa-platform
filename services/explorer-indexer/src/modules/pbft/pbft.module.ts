import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PbftEntity, TransactionEntity } from '@taraxa_project/explorer-shared';
import { Queues } from 'src/types';
import { ConnectorsModule } from '../connectors';
import { TransactionModule } from '../transaction';
import { PbftConsumer } from './pbft.consumer';
import PbftService from './pbft.service';

@Module({
  imports: [
    TransactionModule,
    TypeOrmModule.forFeature([PbftEntity, TransactionEntity]),
    ConnectorsModule,
    BullModule.registerQueue(
      {
        name: Queues.NEW_PBFTS,
      },
      {
        name: Queues.NEW_DAGS,
      }
    ),
  ],
  providers: [PbftService, PbftConsumer],
  controllers: [],
  exports: [PbftService],
})
export class PbftModule {}
