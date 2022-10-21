import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DagEntity, TransactionEntity } from '@taraxa_project/explorer-shared';
import { TransactionModule } from '../transaction';
import DagService from './dag.service';

@Module({
  imports: [
    TransactionModule,
    TypeOrmModule.forFeature([DagEntity, TransactionEntity]),
  ],
  providers: [DagService],
  controllers: [],
  exports: [DagService],
})
export class DagModule {}
