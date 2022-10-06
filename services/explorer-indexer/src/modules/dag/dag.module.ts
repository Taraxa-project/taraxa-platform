import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaraxaNode } from '../node';
import { DagEntity } from './dag.entity';
import DagService from './dag.service';

@Module({
  imports: [TypeOrmModule.forFeature([DagEntity, TaraxaNode])],
  providers: [DagService],
  controllers: [],
  exports: [DagService],
})
export class DagModule {}
