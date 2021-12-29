import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../user/user.decorator';
import { JwtUser } from '../user/jwt-user.type';
import { NodeNotFoundException } from '../node/exceptions/node-not-found-exception';
import { DelegationService } from './delegation.service';
import { Delegation } from './delegation.entity';
import { CreateDelegationDto } from './dto/create-delegation.dto';
import { CreateDelegationNonceDto } from './dto/create-delegation-nonce.dto';

@ApiTags('delegations')
@ApiSecurity('bearer')
@Controller('delegations')
export class DelegationController {
  constructor(private delegationService: DelegationService) {}

  @ApiOkResponse({ description: 'Delegations found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get()
  find(@User() user: JwtUser): Promise<Delegation[]> {
    return this.delegationService.find(user.id);
  }

  @ApiCreatedResponse({
    description: 'The nonce has been successfully created',
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('nonces')
  async createNoce(
    @User() user: JwtUser,
    @Body() nonceDto: CreateDelegationNonceDto,
  ): Promise<string> {
    try {
      return await this.delegationService.createNonce(user.id, nonceDto);
    } catch (e) {
      if (e instanceof NodeNotFoundException) {
        throw new BadRequestException(e.message);
      } else {
        throw e;
      }
    }
  }

  @ApiCreatedResponse({
    description: 'The delegation has been successfully created',
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post()
  async create(
    @User() user: JwtUser,
    @Body() delegation: CreateDelegationDto,
  ): Promise<Delegation> {
    try {
      return await this.delegationService.create(user.id, delegation);
    } catch (e) {
      if (e instanceof NodeNotFoundException) {
        throw new BadRequestException(e.message);
      } else {
        throw e;
      }
    }
  }
}
