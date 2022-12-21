import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BatchEntity } from './entity/batch.entity';
import { PendingRewardEntity } from './entity/pending-reward.entity';
import { RewardEntity } from './entity/reward.entity';
import { AccountEntity } from './entity/account.entity';
import { ClaimEntity } from './entity/claim.entity';
import { AddressChangesEntity } from './entity/address-changes.entity';
import { BatchController } from './batch.controller';
import { RewardController } from './reward.controller';
import { AccountController } from './account.controller';
import { ClaimController } from './claim.controller';
import { ClaimService } from './claim.service';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLService } from './graphql.connector.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BatchEntity,
      PendingRewardEntity,
      RewardEntity,
      AccountEntity,
      ClaimEntity,
      AddressChangesEntity,
    ]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    GraphQLRequestModule.forRootAsync(GraphQLRequestModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          endpoint: config.get<string>('reward.graphQLClaimUrl'),
        };
      },
    }),
  ],
  controllers: [
    BatchController,
    RewardController,
    AccountController,
    ClaimController,
  ],
  providers: [ClaimService, GraphQLService],
  exports: [ClaimService],
})
export class ClaimModule {}
