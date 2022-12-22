import moment from "moment";
import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../user/public.decorator";
import { TotalReward, RewardRepository } from "./reward.repository";
import { RewardService } from "./reward.service";
import { Epoch, getEpochs } from "./helper/epoch";
import { RewardQueryDto } from "./dto/reward-query.dto";
import { Inject } from "@nestjs/common";

@ApiTags("rewards")
@Controller("rewards")
export class RewardsController {
  constructor(
    @Inject("RewardRepository")
    private rewardRepository: RewardRepository,
    private rewardService: RewardService
  ) {}
  @ApiOkResponse({ description: "Rewards found" })
  @Get()
  @Public()
  async getRewards(@Query() query: RewardQueryDto) {
    return this.rewardService.getRewards(query);
  }
  @Get("total")
  @Public()
  async getTotalRewards(
    @Query() query: RewardQueryDto
  ): Promise<TotalReward[]> {
    return this.rewardRepository.groupByAddress(query);
  }
  @ApiOkResponse({ description: "Epochs found" })
  @Get("epochs")
  @Public()
  getEpochs(): Epoch[] {
    return getEpochs(moment().utc().unix());
  }
}
