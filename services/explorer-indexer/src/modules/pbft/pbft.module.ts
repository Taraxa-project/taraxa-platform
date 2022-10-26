import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PbftEntity, TransactionEntity } from '@taraxa_project/explorer-shared';
import { TransactionModule } from '../transaction';
import { PbftConsumer } from './pbft.consumer';
import PbftService from './pbft.service';

@Module({
  imports: [
    TransactionModule,
    TypeOrmModule.forFeature([PbftEntity, TransactionEntity]),
  ],
  providers: [PbftService, PbftConsumer],
  controllers: [],
  exports: [PbftService],
})
export class PbftModule {}
