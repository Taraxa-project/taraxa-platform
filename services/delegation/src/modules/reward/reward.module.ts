import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RewardService } from './reward.service';
import { Reward } from './reward.entity';
import { Node } from '../node/node.entity';
import { NodeCommission } from '../node/node-commission.entity';
import { Delegation } from '../delegation/delegation.entity';

import delegationConfig from '../../config/delegation';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reward, Node, NodeCommission, Delegation]),
    ConfigModule.forFeature(delegationConfig),
  ],
  providers: [RewardService],
})
export class RewardModule {}
