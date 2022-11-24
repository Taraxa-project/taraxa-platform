import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CreateRequestDto } from './dto';
import { RequestEntity } from './entity';
import { FaucetService } from './faucet.service';

@ApiTags('faucet')
@Controller('faucet')
export class FaucetController {
  constructor(private readonly faucetService: FaucetService) {}

  @ApiOkResponse({ description: 'Faucet fund request' })
  @Post('/')
  async register(
    @Req() request: Record<string, any>,
    @Body() requestDto: CreateRequestDto
  ): Promise<Omit<RequestEntity, 'id'>> {
    const ip = request.ips.length ? request.ips[0] : request.ip;
    return await this.faucetService.create(requestDto, ip);
  }

  @SkipThrottle()
  @Get(':uuid')
  async findByHash(
    @Param('uuid', ParseUUIDPipe) uuid: string
  ): Promise<Omit<RequestEntity, 'id'>> {
    return await this.faucetService.getById(uuid);
  }
}
