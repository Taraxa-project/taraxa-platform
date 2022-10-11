import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { toChecksumAddress } from '../../utils';
import { PbftEntity } from '../pbft';
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
    private repository: Repository<NodeEntity>,
    @InjectRepository(PbftEntity)
    private pbftRepository: Repository<PbftEntity>
  ) {}

  public async findAll(filterDto: GetNodesDto): Promise<NodesPaginate> {
    const [nodes, total] = await this.getByFilters(filterDto);
    return {
      data: nodes || [],
      total,
    };
  }

  public async findByAddress(address: string): Promise<NodeDto> {
    const parsedAddress = toChecksumAddress(address);
    const node = await this.repository.findOneBy({ address: parsedAddress });
    if (!node) {
      throw new NotFoundException(
        `There aren't any nodes with the address ${address}`
      );
    }
    return node;
  }

  public async getStats(address: string) {
    // const parsedAddress = toChecksumAddress(address); // We need to add this everywhere we save the miners

    let totalProduced = 0;
    let firstBlockTimestamp = null;
    let lastBlockTimestamp = null;
    let rank: number = null;
    let produced = 0;

    const query = this.pbftRepository
      .createQueryBuilder('pbfts')
      .select(['pbfts.miner', 'pbfts.timestamp'])
      .where('pbfts.miner = :address', { address: address })
      .orderBy(`pbfts.timestamp`, 'ASC');

    try {
      const [blocksProduced, total] = await query.getManyAndCount();

      if (total > 0) {
        totalProduced = total;
        firstBlockTimestamp = blocksProduced[0]?.timestamp;
        lastBlockTimestamp = blocksProduced[totalProduced - 1]?.timestamp;

        const monday = DateTime.now()
          .startOf('week')
          .toSeconds()
          ?.toString()
          .split('.')[0];
        const sunday = DateTime.now()
          .endOf('week')
          .toSeconds()
          ?.toString()
          .split('.')[0];

        try {
          const ranks = await this.repository.query(
            `SELECT row_number() over() AS rank, "address", "count" FROM (SELECT "miner" AS "address", COUNT("hash") AS "count" FROM "pbfts" WHERE timestamp BETWEEN ${monday} AND ${sunday} GROUP BY "miner" ORDER BY "count" DESC) AS nodes`
            // `SELECT "miner" AS "address", COUNT("hash") AS "count" FROM "pbfts" WHERE timestamp BETWEEN ${monday} AND ${sunday} GROUP BY "miner" ORDER BY "count" DESC`
          );
          const addressRank = ranks.find(
            (rank: { rank: number; address: string; count: number }) =>
              rank.address === address
          );
          rank = Number(addressRank.rank);
          produced = Number(addressRank.count);
        } catch (error) {
          this.logger.error(`Failed to get ranks`, error);
          throw new InternalServerErrorException('Internal server exception');
        }
      }
    } catch (error) {
      this.logger.error(`Failed to get stats`, error);
      throw new InternalServerErrorException('Internal server exception');
    }

    return {
      totalProduced,
      firstBlockTimestamp,
      lastBlockTimestamp,
      rank,
      produced,
    };
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
      .createQueryBuilder('nodes')
      .select(['nodes.address', 'nodes.pbftCount']);

    try {
      const results = await query
        .skip(offset)
        .take(limit)
        .orderBy(`nodes.${orderByType}`, orderDirection)
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
