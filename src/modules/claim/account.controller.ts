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
  ApiOkResponse,
  ApiUnauthorizedResponse,
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
  async getAccounts(
    @Query([
      'id',
      'address',
      'availableToBeClaimed',
      'totalLocked',
      'totalClaimed',
    ])
    query: QueryDto,
  ): Promise<CollectionResponse<AccountEntity>> {
    return this.claimService.accounts(query.range, query.sort);
  }
  @ApiOkResponse()
  @Get(':account')
  async getAccount(
    @Param('account') account: string,
  ): Promise<AccountEntity> {
    return this.claimService.account(account);
  }
}
