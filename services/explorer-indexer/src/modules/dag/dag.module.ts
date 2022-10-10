import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DagEntity } from './dag.entity';
import DagService from './dag.service';

@Module({
  imports: [TypeOrmModule.forFeature([DagEntity])],
  providers: [DagService],
  controllers: [],
  exports: [DagService],
})
export class DagModule {}
