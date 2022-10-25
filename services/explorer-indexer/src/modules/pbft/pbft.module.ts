import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionModule } from '../transaction';
import TransactionEntity from '../transaction/transaction.entity';
import { PbftEntity } from './pbft.entity';
import PbftService from './pbft.service';

@Module({
  imports: [
    TransactionModule,
    TypeOrmModule.forFeature([PbftEntity, TransactionEntity]),
  ],
  providers: [PbftService],
  controllers: [],
  exports: [PbftService],
})
export class PbftModule {}
