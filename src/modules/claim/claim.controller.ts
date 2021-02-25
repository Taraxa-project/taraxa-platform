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
import { ClaimEntity } from './entity/claim.entity';
import { UserClaimEntity } from './entity/userClaim.entity';
import {
  PaginationInterceptor,
  CollectionResponse,
} from '@taraxa-claim/common';

@ApiTags('claims')
@Controller('claims')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}
  @ApiOkResponse({ description: 'Claim info' })
  @Get('by-address/:address')
  @UseInterceptors(PaginationInterceptor)
  async userClaims(
    @Param('address') address: string,
  ): Promise<CollectionResponse<UserClaimEntity>> {
    return this.claimService.userClaims(address);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Claim' })
  @ApiUnauthorizedResponse({ description: 'You need a valid token' })
  @Get(':id')
  async getClaim(@Param('id') id: number): Promise<ClaimEntity> {
    return this.claimService.claim(id);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ description: 'You need a valid token' })
  @Delete(':id')
  async deleteClaim(@Param('id') id: number): Promise<ClaimEntity> {
    return this.claimService.deleteClaim(id);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'You need a valid token' })
  @Get()
  @UseInterceptors(PaginationInterceptor)
  async getClaims(): Promise<CollectionResponse<ClaimEntity>> {
    return this.claimService.claims();
  }
}
