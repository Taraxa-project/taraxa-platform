import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../user/user.decorator';
import { JwtUser } from '../user/jwt-user.type';
import { DelegationService } from './delegation.service';
import { CreateUndelegationDto } from './dto/create-undelegation.dto';
import { CreateUndelegationNonceDto } from './dto/create-undelegation-nonce.dto';

@ApiTags('undelegations')
@ApiSecurity('bearer')
@Controller('undelegations')
export class UndelegationController {
  constructor(private delegationService: DelegationService) {}

  @ApiCreatedResponse({
    description: 'The nonce has been successfully created',
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('nonces')
  async createNonce(
    @User() user: JwtUser,
    @Body() nonceDto: CreateUndelegationNonceDto,
  ): Promise<string> {
    return this.delegationService.createUndelegationNonce(user.id, nonceDto);
  }

  @ApiCreatedResponse({
    description: 'The undelegation has been successfully created',
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post()
  delete(
    @User() user: JwtUser,
    @Body() delegation: CreateUndelegationDto,
  ): Promise<void> {
    return this.delegationService.delete(user.id, delegation);
  }
}
