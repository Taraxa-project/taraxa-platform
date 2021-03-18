import { Express } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiConsumes,
  ApiBody,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { RewardEntity } from './entity/reward.entity';
import { CreateBatchDto } from './dto/create-batch.dto';

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
  @ApiInternalServerErrorResponse({ description: 'Invalid CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file',
    type: CreateBatchDto,
  })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createBatch(
    @UploadedFile() file: Express.Multer.File,
    @Body() batchDto: CreateBatchDto,
  ): Promise<RewardEntity[]> {
    const { originalname, mimetype, buffer, size } = file;
    try {
      return await this.claimService.createBatch(
        {
          originalname,
          mimetype,
          buffer,
          size,
        },
        batchDto,
      );
    } catch (e) {
      const message = (e || {}).message || '';
      throw new BadRequestException(message);
    }
  }
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'You need a valid token' })
  @Get(':id')
  async getBatch(@Param('id') id: number): Promise<BatchEntity> {
    return await this.claimService.batch(id);
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
    description: 'filter={"type": "COMMUNITY_ACTIVITY"}',
    required: false,
    type: 'String',
  })
  async getBatches(
    @Query(['id', 'type', 'name', 'createdAt'])
    query: QueryDto,
  ): Promise<CollectionResponse<BatchEntity>> {
    return await this.claimService.batches(
      query.range,
      query.sort,
      query.filter,
    );
  }
}
