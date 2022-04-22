import moment from 'moment';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../user/public.decorator';
import { Reward } from './reward.entity';
import { TotalReward, RewardRepository } from './reward.repository';
import { Epoch, getEpochs } from './helper/epoch';
import { RewardQueryDto } from './dto/reward-query.dto';

@ApiTags('rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private rewardRepository: RewardRepository) {}
  @ApiOkResponse({ description: 'Rewards found' })
  @Get()
  @Public()
  async getRewards(@Query() query: RewardQueryDto): Promise<Reward[]> {
    const { type, epoch, user, address } = query;
    let filter = {};
    if (type) {
      filter = {
        type,
      };
    }
    if (epoch) {
      filter = {
        ...filter,
        epoch,
      };
    }
    if (user) {
      filter = {
        ...filter,
        user,
      };
    }
    if (address) {
      return this.rewardRepository.filterByAddress(address, filter);
    }
    return this.rewardRepository.find(filter);
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
