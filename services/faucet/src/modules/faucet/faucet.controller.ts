import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Post,
  Headers,
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
  async registerClaim(
    @Ip() requestIp: string,
    @Headers('x-forwarded-for') proxy: string,
    @Body() requestDto: CreateRequestDto
  ): Promise<void> {
    const ip = proxy ? proxy : requestIp;
    return await this.faucetService.registerRequest(requestDto, ip);
  }

  @SkipThrottle()
  @Get(':txHash')
  async findByHash(@Param('txHash') txHash: string): Promise<RequestEntity> {
    return await this.faucetService.getByHash(txHash);
  }
}
