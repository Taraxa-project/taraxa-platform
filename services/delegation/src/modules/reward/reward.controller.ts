import moment from 'moment';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../user/public.decorator';
import { TotalReward, RewardRepository } from './reward.repository';
import { RewardService } from './reward.service';
import { Epoch, getEpochs } from './helper/epoch';
import { RewardQueryDto } from './dto/reward-query.dto';

@ApiTags('rewards')
@Controller('rewards')
export class RewardsController {
  constructor(
    private rewardRepository: RewardRepository,
    private rewardService: RewardService,
  ) {}
  @ApiOkResponse({ description: 'Rewards found' })
  @Get()
  @Public()
  async getRewards(@Query() query: RewardQueryDto) {
    return this.rewardService.getRewards(query);
  }
  @Get('total')
  @Public()
  async getTotalRewards(): Promise<TotalReward[]> {
    return this.rewardRepository.groupByAddress();
  }
  @ApiOkResponse({ description: 'Epochs found' })
  @Get('epochs')
  @Public()
  getEpochs(): Epoch[] {
    return getEpochs(moment().utc().unix());
  }
}
