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
