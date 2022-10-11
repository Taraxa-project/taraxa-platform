import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PbftEntity } from '../pbft';
import { NodeController } from './node.controller';
import { NodeEntity } from './node.entity';
import { NodeService } from './node.service';

@Module({
  imports: [TypeOrmModule.forFeature([NodeEntity, PbftEntity])],
  providers: [NodeService],
  controllers: [NodeController],
})
export class NodeModule {}
