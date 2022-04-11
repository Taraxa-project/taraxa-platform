import {
  BadRequestException,
  Controller,
  Delete,
  Get,
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
  ApiOkResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@taraxa-claim/auth';
import { ClaimService } from './claim.service';
import { ClaimEntity } from './entity/claim.entity';
import {
  Query,
  QueryDto,
  PaginationInterceptor,
  CollectionResponse,
} from '@taraxa-claim/common';
import { AccountClaimEntity } from './entity/account-claim.entity';

@ApiTags('claims')
@Controller('claims')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}
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
  @ApiOkResponse({ description: 'Claims' })
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
  async getClaims(
    @Query([
      'id',
      'address',
      'numberOfTokens',
      'claimed',
      'claimedAt',
      'createdAt',
    ])
    query: QueryDto,
  ): Promise<CollectionResponse<ClaimEntity>> {
    return this.claimService.claims(query);
  }
  @ApiCreatedResponse({ description: 'Claim details' })
  @ApiNotFoundResponse({ description: 'Claim not found' })
  @ApiBadRequestResponse({ description: 'No tokens to claim' })
  @Post(':account')
  async createClaimAccount(
    @Param('account') account: string,
  ): Promise<Partial<ClaimEntity>> {
    try {
      return await this.claimService.createClaim(account);
    } catch (e) {
      const error = (e || {}).name || '';
      const message = (e || {}).message || '';
      if (error === 'EntityNotFound') {
        throw new NotFoundException();
      } else {
        throw new BadRequestException(message);
      }
    }
  }
  @ApiCreatedResponse({ description: 'Claim details' })
  @ApiNotFoundResponse({ description: 'Claim not found' })
  @ApiBadRequestResponse({ description: 'No tokens to claim' })
  @Patch(':id')
  async patchClaim(
    @Param('id') id: number,
  ): Promise<Partial<AccountClaimEntity>> {
    try {
      return await this.claimService.patchClaim(id);
    } catch (e) {
      const error = (e || {}).name || '';
      const message = (e || {}).message || '';
      if (error === 'EntityNotFound') {
        throw new NotFoundException();
      } else {
        throw new BadRequestException(message);
      }
    }
  }
}
