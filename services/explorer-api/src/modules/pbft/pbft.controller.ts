import {
  Controller,
  Get,
  HttpStatus,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PbftEntity } from '@taraxa_project/explorer-shared';
import { GetNodesDto } from './dto/get-nodes.dto';
import { NodeDto } from './dto/node.dto';
import { WeekFilterDto } from './dto/week-filter.dto';
import { NodesPaginate, PbftService } from './pbft.service';

@ApiTags('pbft')
@Controller('/pbft')
export class PbftController {
  constructor(private readonly service: PbftService) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    type: [PbftEntity],
    description: 'Returns number of blocks produced this week',
  })
  @Get('blocks-for-week')
  public getTotalBlocksThisWeek(
    @Query(ValidationPipe) weekFilterDto: WeekFilterDto
  ): Promise<number> {
    return this.service.getTotalBlocksForWeek(weekFilterDto);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    type: [PbftEntity],
    description: 'Returns number of blocks produced this week',
  })
  @Get('genesis')
  public async getGenesisBlock(): Promise<Partial<PbftEntity>> {
    const genesisBlock = await this.service.getGenesisBlock();
    delete genesisBlock.id;
    return genesisBlock;
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    type: [NodeDto],
    description: 'Returns all nodes',
  })
  @Get('nodes')
  public getAllNodes(
    @Query(ValidationPipe) filterDto: GetNodesDto
  ): Promise<NodesPaginate> {
    return this.service.getBlocksPerWeek(filterDto);
  }
}
