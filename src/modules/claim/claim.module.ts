import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchEntity } from './entity/batch.entity';
import { RewardEntity } from './entity/reward.entity';
import { AccountEntity } from './entity/account.entity';
import { BatchController } from './batch.controller';
import { RewardController } from './reward.controller';
import { AccountController } from './account.controller';
import { ClaimService } from './claim.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RewardEntity, BatchEntity, AccountEntity]),
  ],
  controllers: [BatchController, RewardController, AccountController],
  providers: [ClaimService],
  exports: [ClaimService],
})
export class ClaimModule {}
