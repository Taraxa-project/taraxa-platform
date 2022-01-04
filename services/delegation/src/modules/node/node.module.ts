import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import delegationConfig from '../../config/delegation';
import { Delegation } from '../delegation/delegation.entity';
import { ProfileModule } from '../profile/profile.module';
import { StakingModule } from '../staking/staking.module';
import { Node } from './node.entity';
import { NodeCommission } from './node-commission.entity';
import { TopUser } from './top-user.entity';
import { NodeController } from './node.controller';
import { ValidatorController } from './validator.controller';
import { NodeService } from './node.service';
import { ValidatorService } from './validator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Node, NodeCommission, Delegation, TopUser]),
    ConfigModule.forFeature(delegationConfig),
    ProfileModule,
    StakingModule,
  ],
  controllers: [NodeController, ValidatorController],
  providers: [NodeService, ValidatorService],
  exports: [TypeOrmModule, NodeService],
})
export class NodeModule {}
