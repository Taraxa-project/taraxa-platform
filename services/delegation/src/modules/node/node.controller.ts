import {
  BadRequestException,
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
  ApiOkResponse,
  ApiQuery,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../user/user.decorator';
import { JwtUser } from '../user/jwt-user.type';
import { ProfileNotFoundException } from '../profile/exceptions/profile-not-found.exception';
import { Node } from './node.entity';
import { NodeType } from './node-type.enum';
import { NodeService } from './node.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { NodeCommission } from './node-commission.entity';
import { NodeAlreadyExistsException } from './exceptions/node-already-exists.exception';
import { NodeNotFoundException } from './exceptions/node-not-found-exception';
import { NodeDoesntBelongToUserException } from './exceptions/node-doesnt-belong-to-user.exception';
import { NodeCantBeDeletedException } from './exceptions/node-cant-be-deleted.exception';
import { NodeDoesntSupportCommissionsException } from './exceptions/node-doesnt-support-commissions';
import { NodeProofInvalidException } from './exceptions/node-proof-invalid';
import { CantAddCommissionException } from './exceptions/cant-add-commission';

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
    try {
      return await this.nodeService.createNode(user.id, node);
    } catch (e) {
      if (
        e instanceof NodeAlreadyExistsException ||
        e instanceof NodeProofInvalidException ||
        e instanceof ProfileNotFoundException
      ) {
        throw new BadRequestException(e.message);
      } else {
        throw e;
      }
    }
  }

  @ApiOkResponse({ description: 'The node has been successfully updated' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Put(':node')
  async updateNode(
    @User() user: JwtUser,
    @Param('node', ParseIntPipe) node: number,
    @Body() nodeDto: UpdateNodeDto,
  ): Promise<Node> {
    try {
      return await this.nodeService.updateNode(user.id, node, nodeDto);
    } catch (e) {
      if (
        e instanceof NodeNotFoundException ||
        e instanceof NodeDoesntBelongToUserException
      ) {
        throw new BadRequestException(e.message);
      } else {
        throw e;
      }
    }
  }

  @ApiOkResponse({ description: 'The node has been successfully deleted' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete(':node')
  async deleteNode(
    @User() user: JwtUser,
    @Param('node', ParseIntPipe) node: number,
  ): Promise<Node> {
    try {
      return await this.nodeService.deleteNode(user.id, node);
    } catch (e) {
      if (
        e instanceof NodeCantBeDeletedException ||
        e instanceof NodeNotFoundException ||
        e instanceof NodeDoesntBelongToUserException
      ) {
        throw new BadRequestException(e.message);
      } else {
        throw e;
      }
    }
  }

  @ApiCreatedResponse({
    description: 'The commission has been successfully created',
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post(':node/commissions')
  async createCommission(
    @User() user: JwtUser,
    @Param('node', ParseIntPipe) node: number,
    @Body() commission: CreateCommissionDto,
  ): Promise<Node> {
    try {
      return await this.nodeService.createCommission(user.id, node, commission);
    } catch (e) {
      if (
        e instanceof NodeDoesntBelongToUserException ||
        e instanceof NodeNotFoundException ||
        e instanceof NodeDoesntSupportCommissionsException ||
        e instanceof CantAddCommissionException
      ) {
        throw new BadRequestException(e.message);
      } else {
        throw e;
      }
    }
  }

  @ApiOkResponse({ description: 'Commissions found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get(':node/commissions')
  async findAllCommissions(
    @User() user: JwtUser,
    @Param('node', ParseIntPipe) node: number,
  ): Promise<NodeCommission[]> {
    try {
      return await this.nodeService.findAllCommissionsByNode(user.id, node);
    } catch (e) {
      if (
        e instanceof NodeDoesntBelongToUserException ||
        e instanceof NodeNotFoundException
      ) {
        throw new BadRequestException(e.message);
      } else {
        throw e;
      }
    }
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
}
