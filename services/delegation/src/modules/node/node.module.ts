import { DynamicModule, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import delegationConfig from '../../config/delegation';
import ethereumConfig from '../../config/ethereum';

import { Delegation } from '../delegation/delegation.entity';
import { Profile } from '../profile/profile.entity';
import { ProfileModule } from '../profile/profile.module';

import { Node } from './node.entity';
import { NodeCommission } from './node-commission.entity';
import { TopUser } from './top-user.entity';

import { NodeController } from './node.controller';
import { ValidatorController } from './validator.controller';

import { NodeService } from './node.service';
import { NodeTaskService } from './node-task.service';
import { ValidatorService } from './validator.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    TypeOrmModule.forFeature([
      Node,
      NodeCommission,
      Delegation,
      Profile,
      TopUser,
    ]),
    ConfigModule.forFeature(delegationConfig),
    ConfigModule.forFeature(ethereumConfig),
    ProfileModule,
  ],
  controllers: [NodeController, ValidatorController],
  providers: [NodeService, ValidatorService],
  exports: [NodeService],
})
export class NodeModule {
  static forRoot(type = 'web'): DynamicModule {
    let providers = [];
    if (type === 'cron') {
      providers = [NodeTaskService];
    }
    return {
      module: NodeModule,
      providers,
    };
  }
}
