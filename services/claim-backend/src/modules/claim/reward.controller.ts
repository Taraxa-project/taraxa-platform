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
  ApiQuery,
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
  @ApiQuery({
    name: 'range',
    description: '[0, 24]',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'sort',
    description: '["title", "ASC"]',
    required: false,
    type: 'String',
  })
  @ApiQuery({
    name: 'filter',
    description: '{"address": "0x8F1567bB4381f4ED53DBEb3C0DCa5C4F189A1110"}',
    required: false,
    type: 'String',
  })
  async getRewards(
    @Query([
      'id',
      'address',
      'numberOfTokens',
      'isUnlocked',
      'unlockDate',
      'createdAt',
      'updatedAt',
      'batch',
      'account',
    ])
    query: QueryDto,
  ): Promise<CollectionResponse<RewardEntity>> {
    return this.claimService.rewards(query);
  }
}
