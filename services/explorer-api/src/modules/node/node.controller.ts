import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiNotFoundResponse } from '@nestjs/swagger';
import { GetNodesDto } from './dto/get-nodes.dto';
import { NodeDto } from './dto/node.dto';
import { NodeService, NodesPaginate } from './node.service';

@ApiTags('nodes')
@Controller('/nodes')
export class NodeController {
  constructor(private readonly service: NodeService) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    type: [NodeDto],
    description: 'Returns all nodes',
  })
  @Get()
  public getAllNodes(
    @Query(ValidationPipe) filterDto: GetNodesDto
  ): Promise<NodesPaginate> {
    return this.service.findAll(filterDto);
  }

  @Get('/:address')
  @ApiOkResponse({ type: NodeDto, description: 'Returns a Node' })
  @ApiNotFoundResponse({
    description: `The node with the address doesn't exist`,
  })
  async getByAddress(
    @Param('address') address: string
  ): Promise<NodeDto | null> {
    return this.service.findByAddress(address);
  }
}
