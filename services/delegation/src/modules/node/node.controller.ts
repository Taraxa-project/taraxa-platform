import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../user/user.decorator';
import { JwtUser } from '../user/jwt-user.type';
import { Node } from './node.entity';
import { NodeType } from './node-type.enum';
import { NodeService } from './node.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { NodeCommission } from './node-commission.entity';

@ApiTags('nodes')
@ApiSecurity('bearer')
@Controller('nodes')
export class NodeController {
  constructor(private nodeService: NodeService) {}

  @ApiCreatedResponse({ description: 'The node has been successfully created' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post()
  async createNode(
    @User() user: JwtUser,
    @Body() node: CreateNodeDto,
  ): Promise<Node> {
    return this.nodeService.createNode(user.id, node);
  }

  @ApiOkResponse({ description: 'The node has been successfully updated' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Put(':node')
  updateNode(
    @User() user: JwtUser,
    @Param('node', ParseIntPipe) node: number,
    @Body() nodeDto: UpdateNodeDto,
  ): Promise<Node> {
    return this.nodeService.updateNode(user.id, node, nodeDto);
  }

  @ApiOkResponse({ description: 'The node has been successfully deleted' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete(':node')
  deleteNode(
    @User() user: JwtUser,
    @Param('node', ParseIntPipe) node: number,
  ): Promise<Node> {
    return this.nodeService.deleteNode(user.id, node);
  }

  @ApiCreatedResponse({
    description: 'The commission has been successfully created',
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post(':node/commissions')
  createCommission(
    @User() user: JwtUser,
    @Param('node', ParseIntPipe) node: number,
    @Body() commission: CreateCommissionDto,
  ): Promise<Node> {
    return this.nodeService.createCommission(user.id, node, commission);
  }

  @ApiOkResponse({ description: 'Commissions found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get(':node/commissions')
  findAllCommissions(
    @User() user: JwtUser,
    @Param('node', ParseIntPipe) node: number,
  ): Promise<NodeCommission[]> {
    return this.nodeService.findAllCommissionsByNode(user.id, node);
  }

  @ApiOkResponse({ description: 'Nodes found' })
  @ApiQuery({ name: 'type', enum: NodeType })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get()
  findAllNodes(
    @User() user: JwtUser,
    @Query('type') type: NodeType = NodeType.TESTNET,
  ): Promise<Node[]> {
    return this.nodeService.findAllNodesByUserAndType(user.id, type);
  }

  @ApiOkResponse({ description: 'Node found' })
  @ApiNotFoundResponse({ description: 'Node not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get(':node')
  findNode(
    @User() user: JwtUser,
    @Param('node', ParseIntPipe) node: number,
  ): Promise<Node> {
    return this.nodeService.findNodeByUserAndId(user.id, node);
  }
}
