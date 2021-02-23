import { Express } from 'express';
import {
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@taraxa-claim/auth';
import { ClaimService } from './claim.service';
import { FileUploadDto } from './dto/file-upload.dto';
import { ClaimEntity } from './entity/claim.entity';

@Controller('claims')
@ApiTags('claims')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Batch created',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    description: 'List of cats',
    type: FileUploadDto,
  })
  @Post()
  async create(
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
}
