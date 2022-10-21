import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';
import { NodeEntity } from '@taraxa_project/explorer-shared';

@Module({
  imports: [TypeOrmModule.forFeature([NodeEntity])],
  providers: [NodeService],
  controllers: [NodeController],
})
export class NodeModule {}
