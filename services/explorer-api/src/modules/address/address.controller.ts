import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { AddressService } from './address.service';
import { PaginationDto } from './dto/pagination.dto';
import {
  BlocksCount,
  DagsPaginate,
  PbftsPaginate,
  StatsResponse,
  TransactionsPaginate,
} from './responses';

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
  ): Promise<BlocksCount> {
    return this.service.getBlocksProduced(address);
  }

  @Get(':address/total-dags')
  async getDagsProduced(
    @Param('address') address: string
  ): Promise<{ total: number }> {
    return this.service.getDagsProduced(address);
  }

  @Get(':address/total-pbfts')
  async getPbftsProduced(
    @Param('address') address: string
  ): Promise<{ total: number }> {
    return this.service.getPbftsProduced(address);
  }

  @Get(':address/dags')
  @ApiNotFoundResponse({
    description: `Can't find any dags for given address`,
  })
  async getDags(
    @Param('address') address: string,
    @Query(ValidationPipe) filterDto: PaginationDto
  ): Promise<DagsPaginate> {
    return this.service.getDags(address, filterDto);
  }

  @Get(':address/pbfts')
  @ApiNotFoundResponse({
    description: `Can't find any pbfts for given address`,
  })
  async getPbfts(
    @Param('address') address: string,
    @Query(ValidationPipe) filterDto: PaginationDto
  ): Promise<PbftsPaginate> {
    return this.service.getPbfts(address, filterDto);
  }

  // Will return too many responses so please use this with caution when testing with Swagger
  @Get(':address/transactions')
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Will return too many responses so please use this with caution',
  })
  @ApiTooManyRequestsResponse({ description: 'Too many responses' })
  @ApiNotFoundResponse({
    description: `Can't find any transactions for given address`,
  })
  async getTransactions(
    @Param('address') address: string,
    @Query(ValidationPipe) filterDto: PaginationDto
  ): Promise<TransactionsPaginate> {
    return this.service.getTransactions(address, filterDto);
  }
}
