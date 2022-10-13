import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionModule } from '../transaction';
import TransactionEntity from '../transaction/transaction.entity';
import { DagEntity } from './dag.entity';
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
