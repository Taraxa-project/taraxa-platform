import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BatchEntity } from './entity/batch.entity';
import { PendingRewardEntity } from './entity/pending-reward.entity';
import { RewardEntity } from './entity/reward.entity';
import { AccountEntity } from './entity/account.entity';
import { ClaimEntity } from './entity/claim.entity';
import { BatchController } from './batch.controller';
import { RewardController } from './reward.controller';
import { AccountController } from './account.controller';
import { ClaimController } from './claim.controller';
import { ClaimService } from './claim.service';
import { BlockchainModule } from '@taraxa-claim/blockchain';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BatchEntity,
      PendingRewardEntity,
      RewardEntity,
      AccountEntity,
      ClaimEntity,
    ]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    BlockchainModule,
  ],
  controllers: [
    BatchController,
    RewardController,
    AccountController,
    ClaimController,
  ],
  providers: [ClaimService],
  exports: [ClaimService],
})
export class ClaimModule {}
