import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@taraxa-claim/auth';
import { ClaimService } from './claim.service';
import {
  Query,
  QueryDto,
  PaginationInterceptor,
  CollectionResponse,
} from '@taraxa-claim/common';
import { BatchEntity } from './entity/batch.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { PendingRewardDto } from './dto/pending-reward.dto';
import { EntityNotFoundError } from 'typeorm';

@ApiBearerAuth()
@ApiTags('batches')
@UseGuards(JwtAuthGuard)
@Controller('batches')
export class BatchController {
  constructor(private readonly claimService: ClaimService) {}
  @ApiCreatedResponse({
    description: 'Batch created',
  })
  @ApiForbiddenResponse({ description: 'You need a valid token' })
  @Post()
  async createBatch(@Body() batchDto: CreateBatchDto): Promise<BatchEntity> {
    return await this.claimService.createBatch(batchDto);
  }
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'You need a valid token' })
  @Get(':id')
  async getBatch(@Param('id') id: number): Promise<BatchEntity> {
    return await this.claimService.batch(id);
  }
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'You need a valid token' })
  @Get(':id/pending-rewards')
  async getPendingRewardsForBatch(
    @Param('id') id: number,
  ): Promise<PendingRewardDto[]> {
    try {
      return await this.claimService.getPendingRewardsForBatch(id);
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException(`Batch with id ${id} not found`);
      } else {
        throw e;
      }
    }
  }
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: 'Batch not found' })
  @ApiInternalServerErrorResponse({
    description: 'Could not change batch status',
  })
  @Patch(':id')
  async patchBatch(
    @Param('id') id: number,
    @Body() batch: UpdateBatchDto,
  ): Promise<BatchEntity> {
    try {
      return await this.claimService.patchBatch(id, batch);
    } catch (e) {
      const error = (e || {}).name || '';
      const message = (e || {}).message || '';
      if (error === 'EntityNotFound') {
        throw new NotFoundException();
      } else {
        throw new InternalServerErrorException(message);
      }
    }
  }
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ description: 'You need a valid token' })
  @Delete(':id')
  async deleteBatch(@Param('id') id: number): Promise<BatchEntity> {
    return this.claimService.deleteBatch(id);
  }
  @ApiOkResponse({ description: 'Batches list' })
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
    description: '{"type": "COMMUNITY_ACTIVITY"}',
    required: false,
    type: 'String',
  })
  async getBatches(
    @Query(['id', 'type', 'name', 'createdAt', 'isDraft'])
    query: QueryDto,
  ): Promise<CollectionResponse<BatchEntity>> {
    return await this.claimService.batches(query);
  }
}
