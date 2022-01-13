import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import delegationConfig from '../../config/delegation';
import ethereumConfig from '../../config/ethereum';
import { NodeModule } from '../node/node.module';
import { StakingModule } from '../staking/staking.module';
import { Node } from '../node/node.entity';
import { Delegation } from './delegation.entity';
import { DelegationNonce } from './delegation-nonce.entity';
import { DelegationController } from './delegation.controller';
import { BalanceController } from './balance.controller';
import { DelegationService } from './delegation.service';
import { DelegationTaskService } from './delegation-task.service';
import { DelegationConsumer } from './delegation.consumer';
import { NodeCreatedListener } from './listener/node-created.listener';
import { NodeDeletedListener } from './listener/node-deleted.listener';

@Module({
  imports: [
    ConfigModule.forFeature(delegationConfig),
    ConfigModule.forFeature(ethereumConfig),
    TypeOrmModule.forFeature([Delegation, DelegationNonce, Node]),
    BullModule.registerQueue({
      name: 'delegation',
    }),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    NodeModule,
    StakingModule,
  ],
  controllers: [DelegationController, BalanceController],
  providers: [
    DelegationService,
    DelegationTaskService,
    DelegationConsumer,
    NodeCreatedListener,
    NodeDeletedListener,
  ],
  exports: [TypeOrmModule],
})
export class DelegationModule {}
