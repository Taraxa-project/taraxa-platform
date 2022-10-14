import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeEntity } from '../node';
import { DagEntity, PbftEntity, TransactionEntity } from '../pbft';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NodeEntity,
      DagEntity,
      PbftEntity,
      TransactionEntity,
    ]),
  ],
  providers: [AddressService],
  controllers: [AddressController],
})
export class AddressModule {}
