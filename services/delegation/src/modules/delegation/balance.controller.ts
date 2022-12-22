import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../user/public.decorator";
import { DelegationService } from "./delegation.service";
import { BalancesByNodeDto } from "./dto/balances-by-node.dto";
import { BalancesDto } from "./dto/balances.dto";

@ApiTags("delegations")
@Controller("delegations")
export class BalanceController {
  constructor(private delegationService: DelegationService) {}
  @Public()
  @ApiOkResponse({ description: "Balances found" })
  @Get(":address/balances")
  getBalances(@Param("address") address: string): Promise<BalancesDto> {
    return this.delegationService.getBalances(address);
  }
  @Public()
  @ApiOkResponse({ description: "Balances found" })
  @Get(":wallet/balances/:node")
  getBalancesByNode(
    @Param("wallet") wallet: string,
    @Param("node", ParseIntPipe) node: number
  ): Promise<BalancesByNodeDto> {
    return this.delegationService.getBalancesByNode(wallet, node);
  }
}
