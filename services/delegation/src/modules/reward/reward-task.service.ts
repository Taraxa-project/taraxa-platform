import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { RewardService } from "./reward.service";

@Injectable()
export class RewardTaskService implements OnModuleInit {
  private readonly logger = new Logger(RewardTaskService.name);

  constructor(private rewardService: RewardService) {}
  onModuleInit() {
    this.logger.debug(`Init ${RewardTaskService.name} cron`);
  }

  @Cron("0 2 15 * *")
  async calculateRewardsForNextEpoch() {
    this.logger.debug("Calculating rewards for next epoch...");
    await this.rewardService.calculateRewardsForNextEpoch();
  }
}
