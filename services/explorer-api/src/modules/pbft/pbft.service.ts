import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Repository, Between } from 'typeorm';
import { PbftEntity } from '@taraxa_project/explorer-shared';
import { GetNodesDto } from './dto/get-nodes.dto';
import { WeekFilterDto } from './dto/week-filter.dto';
import { NodeDto } from './dto/node.dto';

export interface NodesPaginate {
  data: NodeDto[];
  total: number;
}

@Injectable()
export class PbftService {
  private logger = new Logger('PbftService');

  constructor(
    @InjectRepository(PbftEntity)
    private repository: Repository<PbftEntity>
  ) {}

  public async getGenesisBlock(): Promise<PbftEntity> {
    return await this.repository.findOne({
      where: {
        number: 0,
      },
      relations: ['transactions'],
    });
  }

  public async getTotalBlocksForWeek(
    weekFilterDto: WeekFilterDto
  ): Promise<number> {
    const { week, year } = weekFilterDto;
    const { startTimestamp, endTimestamp } = this.getTimestamps(week, year);

    const total = await this.repository.findBy({
      timestamp: Between(Number(startTimestamp), Number(endTimestamp)),
    });
    return total.length;
  }

  public async getLatestIndexedBlock(): Promise<number> {
    const res = await this.repository.query(
      `SELECT MAX(p.number) as number FROM ${this.repository.metadata.tableName} p`
    );
    return res[0]?.number;
  }

  public async getBlocksCount(): Promise<number> {
    const res = await this.repository.query(
      `SELECT CAST(COUNT(p.number) as numeric) as count FROM ${this.repository.metadata.tableName} p`
    );
    return res[0]?.count;
  }

  public async getBlocksPerWeek(
    filterDto: GetNodesDto
  ): Promise<NodesPaginate> {
    const { take, skip, week, year } = filterDto;
    const limit = take || 0;
    const offset = skip || 0;

    const { startTimestamp, endTimestamp } = this.getTimestamps(week, year);

    const [{ total }] = await this.repository.query(
      `SELECT COUNT(DISTINCT miner) as total from ${this.repository.metadata.tableName} WHERE "timestamp" BETWEEN ${startTimestamp} AND ${endTimestamp}`
    );

    const query = `
      SELECT "miner" AS "address", COUNT("hash") AS "pbftCount"
      FROM ${this.repository.metadata.tableName}
      WHERE "timestamp" BETWEEN $1 AND $2
      GROUP BY "miner"
      ORDER BY "pbftCount" DESC, "miner"
      LIMIT $3 OFFSET $4`;

    const res = await this.repository.query(query, [
      startTimestamp,
      endTimestamp,
      limit,
      offset,
    ]);
    return {
      data: res || [],
      total,
    };
  }

  private getTimestamps(week: number, year: number) {
    const startTimestamp = DateTime.fromObject({
      weekNumber: week,
      weekYear: year,
    })
      .startOf('week')
      .toSeconds()
      ?.toString()
      .split('.')[0];
    const endTimestamp = DateTime.fromObject({
      weekNumber: week,
      weekYear: year,
    })
      .endOf('week')
      .toSeconds()
      ?.toString()
      .split('.')[0];

    return {
      startTimestamp,
      endTimestamp,
    };
  }
}
