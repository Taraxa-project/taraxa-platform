import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import ethereumConfig from '../../config/ethereum';
import stakingConfig from '../../config/staking';
import { StakingService } from './staking.service';

@Module({
  imports: [
    ConfigModule.forFeature(ethereumConfig),
    ConfigModule.forFeature(stakingConfig),
  ],
  providers: [StakingService],
  exports: [StakingService],
})
export class StakingModule {}
