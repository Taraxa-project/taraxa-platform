import { Express } from 'express';
import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@taraxa-claim/auth';
import { ClaimService } from './claim.service';
import {
  PaginationInterceptor,
  CollectionResponse,
} from '@taraxa-claim/common';
import { BatchEntity } from './entity/batch.entity';

@ApiBearerAuth()
@ApiTags('batches')
@UseGuards(JwtAuthGuard)
@Controller('batches')
export class BatchesController {
  constructor(private readonly claimService: ClaimService) {}
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Get()
  @UseInterceptors(PaginationInterceptor)
  async getBatches(): Promise<CollectionResponse<BatchEntity>> {
    return await this.claimService.batches();
  }
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Get(':id')
  async getBatch(@Param('id') id: number): Promise<BatchEntity> {
    return await this.claimService.batch(id);
  }
}
