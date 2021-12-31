import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import delegationConfig from '../../config/delegation';
import { NodeModule } from '../node/node.module';
import { StakingModule } from '../staking/staking.module';
import { Node } from '../node/node.entity';
import { Delegation } from './delegation.entity';
import { DelegationNonce } from './delegation-nonce.entity';
import { DelegationController } from './delegation.controller';
import { BalanceController } from './balance.controller';
import { DelegationService } from './delegation.service';
import { DelegationTaskService } from './delegation-task.service';

@Module({
  imports: [
    ConfigModule.forFeature(delegationConfig),
    TypeOrmModule.forFeature([Delegation, DelegationNonce, Node]),
    NodeModule,
    StakingModule,
  ],
  controllers: [DelegationController, BalanceController],
  providers: [DelegationService, DelegationTaskService],
  exports: [TypeOrmModule],
})
export class DelegationModule {}
