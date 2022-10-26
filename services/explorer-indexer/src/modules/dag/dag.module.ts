import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DagEntity, TransactionEntity } from '@taraxa_project/explorer-shared';
import { ConnectorsModule } from '../connectors';
import { TransactionModule } from '../transaction';
import { DagConsumer } from './dag.consumer';
import DagService from './dag.service';

@Module({
  imports: [
    TransactionModule,
    TypeOrmModule.forFeature([DagEntity, TransactionEntity]),
    ConnectorsModule,
  ],
  providers: [DagService, DagConsumer],
  controllers: [],
  exports: [DagService],
})
export class DagModule {}
