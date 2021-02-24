import { Express } from 'express';
import {
  Controller,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@taraxa-claim/auth';
import { ClaimService } from './claim.service';
import {
  PaginationInterceptor,
  CollectionResponse,
} from '@taraxa-claim/common';
import { BatchEntity } from './entity/batch.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClaimEntity } from './entity/claim.entity';
import { FileUploadDto } from './dto/file-upload.dto';

@ApiBearerAuth()
@ApiTags('batches')
@UseGuards(JwtAuthGuard)
@Controller('batches')
export class BatchController {
  constructor(private readonly claimService: ClaimService) {}
  @ApiCreatedResponse({
    description: 'Batch created',
  })
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file',
    type: FileUploadDto,
  })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createBatch(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ClaimEntity[]> {
    const { mimetype, buffer, size } = file;
    try {
      return await this.claimService.createBatch({
        mimetype,
        buffer,
        size,
      });
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
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
