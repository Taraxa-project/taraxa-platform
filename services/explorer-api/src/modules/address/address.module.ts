import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeEntity } from '../node';
import { DagEntity, PbftEntity, TransactionEntity } from '../pbft';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import general from 'src/config/general';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forFeature(general),
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
