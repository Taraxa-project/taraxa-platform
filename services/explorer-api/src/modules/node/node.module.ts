import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeController } from './node.controller';
import { NodeEntity } from './node.entity';
import { NodeService } from './node.service';

@Module({
  imports: [TypeOrmModule.forFeature([NodeEntity])],
  providers: [NodeService],
  controllers: [NodeController],
})
export class NodeModule {}
