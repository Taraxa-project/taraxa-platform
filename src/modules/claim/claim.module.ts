import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchEntity } from './entity/batch.entity';
import { RewardEntity } from './entity/reward.entity';
import { AccountEntity } from './entity/account.entity';
import { ClaimEntity } from './entity/claim.entity';
import { BatchController } from './batch.controller';
import { RewardController } from './reward.controller';
import { AccountController } from './account.controller';
import { ClaimController } from './claim.controller';
import { ClaimService } from './claim.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BatchEntity,
      RewardEntity,
      AccountEntity,
      ClaimEntity,
    ]),
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
