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
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@taraxa-claim/auth';
import { ClaimService } from './claim.service';
import { FileUploadDto } from './dto/file-upload.dto';
import { ClaimEntity } from './entity/claim.entity';
import {
  PaginationInterceptor,
  CollectionResponse,
} from '@taraxa-claim/common';

@ApiBearerAuth()
@ApiTags('claims')
@UseGuards(JwtAuthGuard)
@Controller('claims')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}
  @ApiCreatedResponse({
    description: 'Batch created',
  })
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of cats',
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
  @Get(':id')
  async getClaim(@Param('id') id: number): Promise<ClaimEntity> {
    return await this.claimService.claim(id);
  }
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Get()
  @UseInterceptors(PaginationInterceptor)
  async getClaims(): Promise<CollectionResponse<ClaimEntity>> {
    return await this.claimService.claims();
  }
}
