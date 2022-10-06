import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DagEntity } from './dag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DagModule])],
  providers: [],
  controllers: [],
})
export class DagModule {}
