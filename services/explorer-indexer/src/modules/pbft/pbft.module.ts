import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaraxaNode } from '../node';
import { PbftEntity } from './pbft.entity';
import PbftService from './pbft.service';

@Module({
  imports: [TypeOrmModule.forFeature([PbftEntity, TaraxaNode])],
  providers: [PbftService],
  controllers: [],
  exports: [PbftService],
})
export class PbftModule {}
