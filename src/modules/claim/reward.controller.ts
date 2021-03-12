import {
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@taraxa-claim/auth';
import { ClaimService } from './claim.service';
import { RewardEntity } from './entity/reward.entity';
import {
  Query,
  QueryDto,
  PaginationInterceptor,
  CollectionResponse,
} from '@taraxa-claim/common';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('rewards')
@Controller('rewards')
export class RewardController {
  constructor(private readonly claimService: ClaimService) {}
  @ApiOkResponse({ description: 'Reward' })
  @ApiUnauthorizedResponse({ description: 'You need a valid token' })
  @Get(':id')
  async getReward(@Param('id') id: number): Promise<RewardEntity> {
    return this.claimService.reward(id);
  }
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ description: 'You need a valid token' })
  @Delete(':id')
  async deleteReward(@Param('id') id: number): Promise<RewardEntity> {
    return this.claimService.deleteReward(id);
  }
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'You need a valid token' })
  @Get()
  @UseInterceptors(PaginationInterceptor)
  async getRewards(
    @Query(['id', 'address', 'numberOfTokens', 'unlockDate', 'createdAt'])
    query: QueryDto,
  ): Promise<CollectionResponse<RewardEntity>> {
    return this.claimService.rewards(query.range, query.sort);
  }
}
