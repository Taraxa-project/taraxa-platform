import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
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
import { AccountEntity } from './entity/account.entity';
import { ClaimEntity } from './entity/claim.entity';
import { Raw } from 'typeorm';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly claimService: ClaimService) {}
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  async getAccounts(
    @Query([
      'id',
      'address',
      'availableToBeClaimed',
      'totalLocked',
      'totalClaimed',
      'batch',
    ])
    query: QueryDto,
  ): Promise<CollectionResponse<AccountEntity>> {
    return this.claimService.accounts(query);
  }
  @ApiOkResponse({ description: 'Account details' })
  @ApiNotFoundResponse({ description: 'Account not found' })
  @Post(':account')
  async getAccount(
    @Param('account') account: string,
  ): Promise<Partial<AccountEntity>> {
    return await this.claimService.account(account);
  }
  @ApiOkResponse({ description: 'List of claims' })
  @ApiUnauthorizedResponse({ description: 'You need a valid token' })
  @ApiNotFoundResponse({ description: 'Claim not found' })
  @Get('/claims/:account')
  async getClaimOfAccount(
    @Param('account') account: string,
  ): Promise<CollectionResponse<ClaimEntity>> {
    return this.claimService.claims({
      filter: {
        address: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:account)`, {
          account,
        }),
      },
      range: [0, 100],
      sort: ['createdAt', 'DESC'],
    } as QueryDto);
  }
}
