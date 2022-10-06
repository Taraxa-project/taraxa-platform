import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeController } from './node.controller';
import { TaraxaNode } from './node.entity';
import { NodeService } from './node.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaraxaNode])],
  providers: [NodeService],
  controllers: [NodeController],
})
export class NodeModule {}
