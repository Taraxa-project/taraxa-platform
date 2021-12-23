import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import delegationConfig from '../../config/delegation';
import { ProfileModule } from '../profile/profile.module';
import { Node } from './node.entity';
import { NodeCommission } from './node-commission.entity';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Node, NodeCommission]),
    ConfigModule.forFeature(delegationConfig),
    ProfileModule,
  ],
  controllers: [NodeController],
  providers: [NodeService],
  exports: [TypeOrmModule],
})
export class NodeModule {}
