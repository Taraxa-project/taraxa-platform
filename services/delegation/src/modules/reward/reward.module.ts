import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Node } from '../node/node.entity';
import { NodeCommission } from '../node/node-commission.entity';
import { Delegation } from '../delegation/delegation.entity';
import { DelegationDataService } from './data/delegation-data.service';
import { StakingDataService } from './data/staking-data.service';
import { RewardService } from './reward.service';
import { Reward } from './reward.entity';

import indexerConfig from '../../config/indexer';
import delegationConfig from '../../config/delegation';

@Module({
  imports: [
    ConfigModule.forFeature(indexerConfig),
    ConfigModule.forFeature(delegationConfig),
    TypeOrmModule.forFeature([Reward, Node, NodeCommission, Delegation]),
  ],
  providers: [StakingDataService, DelegationDataService, RewardService],
})
export class RewardModule {}
