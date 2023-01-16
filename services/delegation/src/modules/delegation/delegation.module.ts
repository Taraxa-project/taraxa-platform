import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import delegationConfig from '../../config/delegation';
import ethereumConfig from '../../config/ethereum';
import { StakingModule } from '../staking/staking.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { Node } from '../node/node.entity';
import { Delegation } from './delegation.entity';
import { DelegationNonce } from './delegation-nonce.entity';
import { DelegationController } from './delegation.controller';
import { UndelegationController } from './undelegation.controller';
import { BalanceController } from './balance.controller';
import { DelegationService } from './delegation.service';
import { DelegationTaskService } from './delegation-task.service';
import { DelegationConsumer } from './delegation.consumer';
import { DelegationCreatedListener } from './listener/delegation-created.listener';
import { DelegationDeletedListener } from './listener/delegation-deleted.listener';
import { Undelegation } from './undelegation.entity';

@Module({
  imports: [
    ConfigModule.forFeature(delegationConfig),
    ConfigModule.forFeature(ethereumConfig),
    TypeOrmModule.forFeature([Delegation, Undelegation, DelegationNonce, Node]),
    BullModule.registerQueue({
      name: 'delegation',
    }),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    StakingModule,
    BlockchainModule,
  ],
  controllers: [
    DelegationController,
    UndelegationController,
    BalanceController,
  ],
  providers: [
    DelegationService,
    DelegationCreatedListener,
    DelegationDeletedListener,
  ],
  exports: [TypeOrmModule],
})
export class DelegationModule {
  static forRoot(type = 'web'): DynamicModule {
    let providers = [];
    if (type === 'cron') {
      providers = [DelegationTaskService];
    }
    if (type === 'worker') {
      providers = [DelegationConsumer];
    }
    return {
      module: DelegationModule,
      providers,
    };
  }
}
