import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaraxaNode } from './node.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaraxaNode])],
  providers: [],
  controllers: [],
})
export class NodeModule {}
