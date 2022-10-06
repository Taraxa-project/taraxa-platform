import {
  Controller,
  Get,
  HttpStatus,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetNodesDto } from './dto/get-nodes.dto';
import { TaraxaNode } from './node.entity';
import { NodeService, NodesPaginate } from './node.service';

@ApiTags('nodes')
@Controller('/nodes')
export class NodeController {
  constructor(private readonly service: NodeService) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    type: [TaraxaNode],
    description: 'Returns all nodes',
  })
  @Get()
  public getAllNodes(
    @Query(ValidationPipe) filterDto: GetNodesDto
  ): Promise<NodesPaginate> {
    return this.service.findAll(filterDto);
  }
}
