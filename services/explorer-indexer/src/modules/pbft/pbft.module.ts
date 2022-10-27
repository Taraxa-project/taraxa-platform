import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PbftEntity, TransactionEntity } from '@taraxa_project/explorer-shared';
import { ConnectorsModule } from '../connectors';
import { DagModule } from '../dag';
import { TransactionModule } from '../transaction';
import { PbftConsumer } from './pbft.consumer';
import PbftService from './pbft.service';

@Module({
  imports: [
    TransactionModule,
    DagModule,
    TypeOrmModule.forFeature([PbftEntity, TransactionEntity]),
    ConnectorsModule,
    BullModule.registerQueue(
      {
        name: 'new_pbfts',
      },
      {
        name: 'new_dags',
      }
    ),
  ],
  providers: [PbftService, PbftConsumer],
  controllers: [],
  exports: [PbftService],
})
export class PbftModule {}
