import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../user/public.decorator';
import { DelegationService } from './delegation.service';
import { BalancesDto } from './dto/balances.dto';

@ApiTags('delegations')
@Controller('delegations')
export class BalanceController {
  constructor(private delegationService: DelegationService) {}
  @Public()
  @ApiOkResponse({ description: 'Balances found' })
  @Get(':address/balances')
  getBalances(@Param('address') address: string): Promise<BalancesDto> {
    return this.delegationService.getBalances(address);
  }
}
