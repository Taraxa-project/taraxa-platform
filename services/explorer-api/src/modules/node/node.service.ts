import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetNodesDto } from './dto/get-nodes.dto';
import { NodeDto } from './dto/node.dto';
import { NodeEntity } from './node.entity';

export interface NodesPaginate {
  data: NodeDto[];
  total: number;
}

@Injectable()
export class NodeService {
  private logger = new Logger('NodeService');

  constructor(
    @InjectRepository(NodeEntity)
    private repository: Repository<NodeEntity>
  ) {}

  public async findAll(filterDto: GetNodesDto): Promise<NodesPaginate> {
    const [nodes, total] = await this.getByFilters(filterDto);
    return {
      data: nodes || [],
      total,
    };
  }

  public async findByAddress(address: string): Promise<NodeDto> {
    const node = await this.repository.findOneBy({ address: address });
    if (!node) {
      throw new NotFoundException(
        `There aren't any nodes with the address ${address}`
      );
    }
    return node;
  }

  private async getByFilters(
    filterDto: GetNodesDto
  ): Promise<[NodeDto[], number]> {
    const { take, skip } = filterDto;
    const limit = take || 0;
    const offset = skip || 0;
    const orderByType = 'pbftCount';
    const orderDirection: 'ASC' | 'DESC' = 'DESC';

    const query = this.repository
      .createQueryBuilder('explorer_node')
      .select(['explorer_node.address', 'explorer_node.pbftCount']);

    try {
      const results = await query
        .skip(offset)
        .take(limit)
        .orderBy(`explorer_node.${orderByType}`, orderDirection)
        .getManyAndCount();
      return results;
    } catch (error) {
      this.logger.error(
        `Failed to get nodes, DTO: ${JSON.stringify(filterDto)}`,
        error
      );
      throw new InternalServerErrorException('Internal server exception');
    }
  }
}
