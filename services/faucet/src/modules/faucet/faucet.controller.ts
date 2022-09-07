import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
  async registerClaim(@Body() requestDto: CreateRequestDto): Promise<void> {
    return await this.faucetService.registerRequest(requestDto);
  }

  @SkipThrottle()
  @Get(':txHash')
  async findByHash(@Param('txHash') txHash: string): Promise<RequestEntity> {
    return await this.faucetService.getByHash(txHash);
  }
}
