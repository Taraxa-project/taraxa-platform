import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetNodesDto } from './dto/get-nodes.dto';
import { TaraxaNode } from './node.entity';

export interface NodesPaginate {
  data: TaraxaNode[];
  total: number;
}

@Injectable()
export class NodeService {
  private logger = new Logger('NodeService');

  constructor(
    @InjectRepository(TaraxaNode)
    private repository: Repository<TaraxaNode>
  ) {}

  public async findAll(filterDto: GetNodesDto): Promise<NodesPaginate> {
    const [nodes, total] = await this.getByFilters(filterDto);
    return {
      data: nodes || [],
      total,
    };
  }

  private async getByFilters(
    filterDto: GetNodesDto
  ): Promise<[TaraxaNode[], number]> {
    const { take, skip } = filterDto;
    const limit = take || 0;
    const offset = skip || 0;
    const orderByType = 'pbftCount';
    const orderDirection: 'ASC' | 'DESC' = 'DESC';

    const query = this.repository
      .createQueryBuilder('explorer_node')
      .select([
        'explorer_node.id',
        'explorer_node.address',
        'explorer_node.pbftCount',
        'explorer_node.createdAt',
        'explorer_node.updatedAt',
      ]);

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
