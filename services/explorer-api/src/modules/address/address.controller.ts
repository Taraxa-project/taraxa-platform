import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { DagEntity, PbftEntity, TransactionEntity } from '../pbft';
import { StatsResponse, AddressService } from './address.service';

@ApiTags('address')
@Controller('/address')
export class AddressController {
  constructor(private readonly service: AddressService) {}

  @Get(':address/stats')
  @ApiNotFoundResponse({
    description: `Cannot provide stats for given address`,
  })
  async getStats(@Param('address') address: string): Promise<StatsResponse> {
    return this.service.getStats(address);
  }

  @Get(':address/blocks')
  @ApiNotFoundResponse({
    description: `Can't find any blocks produced this week for given address`,
  })
  async getBlocksProduced(
    @Param('address') address: string
  ): Promise<{ dags: number; pbft: number }> {
    return this.service.getBlocksProduced(address);
  }

  @Get(':address/dags')
  @ApiNotFoundResponse({
    description: `Can't find any dags for given address`,
  })
  async getDags(@Param('address') address: string): Promise<DagEntity[]> {
    return this.service.getDags(address);
  }

  @Get(':address/pbfts')
  @ApiNotFoundResponse({
    description: `Can't find any pbfts for given address`,
  })
  async getPbfts(@Param('address') address: string): Promise<PbftEntity[]> {
    return this.service.getPbfts(address);
  }

  // Will return too many responses so please use this with caution when testing with Swagger
  @Get(':address/transactions')
  @ApiResponse({
    status: HttpStatus.OK,
    type: [TransactionEntity],
    description:
      'Will return too many responses so please use this with caution',
  })
  @ApiTooManyRequestsResponse({ description: 'Too many responses' })
  @ApiNotFoundResponse({
    description: `Can't find any transactions for given address`,
  })
  async getTransactions(
    @Param('address') address: string
  ): Promise<TransactionEntity[]> {
    return this.service.getTransactions(address);
  }
}
