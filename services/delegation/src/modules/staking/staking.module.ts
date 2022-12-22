import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import ethereumConfig from "../../config/ethereum";
import stakingConfig from "../../config/staking";
import { StakingService } from "./staking.service";

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    ConfigModule.forFeature(ethereumConfig),
    ConfigModule.forFeature(stakingConfig),
  ],
  providers: [StakingService],
  exports: [StakingService],
})
export class StakingModule {}
