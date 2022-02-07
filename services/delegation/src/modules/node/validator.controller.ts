import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../user/public.decorator';
import { User } from '../user/user.decorator';
import { JwtUser } from '../user/jwt-user.type';
import { Node } from './node.entity';
import { ValidatorService } from './validator.service';
import { Delegation } from '../delegation/delegation.entity';

@Public()
@ApiTags('validators')
@Controller('validators')
export class ValidatorController {
  constructor(private validatorService: ValidatorService) {}

  @ApiSecurity('bearer')
  @ApiOkResponse({ description: 'Validators found' })
  @ApiQuery({ name: 'show_my_validators', type: Boolean })
  @ApiQuery({ name: 'show_fully_delegated', type: Boolean })
  @Get()
  findAllNodes(
    @User() user: JwtUser | false,
    @Query('show_my_validators', ParseBoolPipe)
    showMyValidators = false,
    @Query('show_fully_delegated', ParseBoolPipe)
    showFullyDelegated = true,
  ): Promise<Partial<Node>[]> {
    return this.validatorService.find(
      user ? user.id : null,
      showMyValidators,
      showFullyDelegated,
    );
  }

  @ApiOkResponse({ description: 'Validator found' })
  @ApiNotFoundResponse({ description: 'Validator not found' })
  @Get(':id')
  get(
    @User() user: JwtUser | false,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Partial<Node>> {
    return this.validatorService.get(id, user ? user.id : null);
  }

  @ApiOkResponse({ description: 'Delegations found' })
  @ApiNotFoundResponse({ description: 'Validator not found' })
  @ApiQuery({ name: 'show_my_delegation_at_the_top', type: Boolean })
  @ApiQuery({ name: 'page', type: Number })
  @Get(':id/delegations')
  getDelegations(
    @User() user: JwtUser | false,
    @Param('id', ParseIntPipe) id: number,
    @Query('show_my_delegation_at_the_top', ParseBoolPipe)
    showMyDelegationAtTheTop: boolean,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<{ count: number; data: Partial<Delegation>[] }> {
    return this.validatorService.getDelegations(
      id,
      user ? user.id : null,
      showMyDelegationAtTheTop,
      page,
    );
  }
}
