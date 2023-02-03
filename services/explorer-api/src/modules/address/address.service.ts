import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { isAddress } from 'web3-utils';
import {
  PbftEntity,
  DagEntity,
  TransactionEntity,
  toChecksumAddress,
} from '@taraxa_project/explorer-shared';
import {
  StatsResponse,
  BlocksCount,
  TransactionsPaginate,
  PbftsPaginate,
  DagsPaginate,
} from './responses';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class AddressService {
  private logger = new Logger('AddressService');

  constructor(
    @InjectRepository(DagEntity)
    private dagRepository: Repository<DagEntity>,
    @InjectRepository(PbftEntity)
    private pbftRepository: Repository<PbftEntity>,
    @InjectRepository(TransactionEntity)
    private txRepository: Repository<TransactionEntity>
  ) {}

  public async getStats(address: string): Promise<StatsResponse> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    const parsedAddress = toChecksumAddress(address);

    let totalProduced = 0;
    let firstBlockTimestamp = null;
    let lastBlockTimestamp = null;
    let rank: number = null;
    let produced = 0;

    const query = this.pbftRepository
      .createQueryBuilder('pbfts')
      .select(['miner', 'timestamp'])
      .where(`lower(miner) = lower('${parsedAddress}')`)
      .orderBy('timestamp', 'DESC');

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
          const ranks = await this.pbftRepository.query(
            `SELECT row_number() over() AS rank, "address", "count" FROM (SELECT "miner" AS "address", COUNT("hash") AS "count" FROM "${this.pbftRepository.metadata.tableName}" WHERE timestamp BETWEEN ${monday} AND ${sunday} GROUP BY "miner" ORDER BY "count" DESC) AS nodes`
            // `SELECT "miner" AS "address", COUNT("hash") AS "count" FROM "pbfts" WHERE timestamp BETWEEN ${monday} AND ${sunday} GROUP BY "miner" ORDER BY "count" DESC`
          );
          const addressRank = ranks.find(
            (rank: { rank: number; address: string; count: number }) =>
              rank.address === parsedAddress
          );
          rank = Number(addressRank?.rank || 0);
          produced = Number(addressRank?.count || 0);
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

  public async getBlocksProduced(address: string): Promise<BlocksCount> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    const parsedAddress = toChecksumAddress(address);

    const [{ pbfts_mined }] = await this.pbftRepository.query(
      `SELECT COUNT(DISTINCT hash) as pbfts_mined from ${this.pbftRepository.metadata.tableName} WHERE miner = '${parsedAddress}';`
    );
    const [{ dags_mined }] = await this.pbftRepository.query(
      `SELECT COUNT(hash) as dags_mined from ${this.dagRepository.metadata.tableName}  WHERE author = '${parsedAddress}';`
    );

    return {
      dags: dags_mined,
      pbfts: pbfts_mined,
    };
  }

  public async getDagsProduced(address: string): Promise<{ total: number }> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    const parsedAddress = toChecksumAddress(address);

    const [{ dags_mined }] = await this.pbftRepository.query(
      `SELECT COUNT(hash) as dags_mined from ${this.dagRepository.metadata.tableName}  WHERE author = '${parsedAddress}';`
    );

    return {
      total: dags_mined,
    };
  }

  public async getPbftsProduced(address: string): Promise<{ total: number }> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    const parsedAddress = toChecksumAddress(address);

    const [{ pbfts_mined }] = await this.pbftRepository.query(
      `SELECT COUNT(DISTINCT hash) as pbfts_mined from ${this.pbftRepository.metadata.tableName} WHERE miner = '${parsedAddress}';`
    );

    return {
      total: pbfts_mined,
    };
  }

  public async getDags(
    address: string,
    filterDto: PaginationDto
  ): Promise<DagsPaginate> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    const take = Number(filterDto.take);
    const skip = Number(filterDto.skip);
    const page = skip === 0 ? skip : Math.floor(skip / take);

    const growthFactor = 5;
    const parsedAddress = toChecksumAddress(address);

    const query = `
      SELECT d.timestamp, d.level, d.hash, d."transactionCount"
      FROM ${this.dagRepository.metadata.tableName} d
      WHERE d.author = $1
      ORDER BY d.timestamp DESC
      LIMIT $2 OFFSET $3`;

    const res = await this.dagRepository.query(query, [
      parsedAddress,
      Number(take) + growthFactor, // always return growthFactor more to show next btn in pagination
      skip,
    ]);

    const dags = [...res];
    if (res.length > take) {
      // Remove last growthFactor (elements) from array
      dags.splice(-growthFactor, growthFactor);
    }

    const total =
      res.length <= take
        ? res.length + take * page
        : (take + growthFactor) * (page + 1);

    return {
      data: dags,
      total,
    };
  }

  public async getPbfts(
    address: string,
    filterDto: PaginationDto
  ): Promise<PbftsPaginate> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    const take = Number(filterDto.take);
    const skip = Number(filterDto.skip);
    const page = skip === 0 ? skip : Math.floor(skip / take);

    const growthFactor = 5;
    const parsedAddress = toChecksumAddress(address);

    const query = `
      SELECT p.timestamp, p.number, p.hash, p."transactionCount"
      FROM ${this.pbftRepository.metadata.tableName} p
      WHERE p.miner = $1
      ORDER BY p.timestamp DESC
      LIMIT $2 OFFSET $3`;

    const res = await this.pbftRepository.query(query, [
      parsedAddress,
      take + growthFactor, // always return growthFactor more to show next btn in pagination
      skip,
    ]);

    const pbfts = [...res];
    if (res.length > take) {
      // Remove last growthFactor (elements) from array
      pbfts.splice(-growthFactor, growthFactor);
    }
    const total =
      res.length <= take
        ? res.length + take * page
        : (take + growthFactor) * (page + 1);

    return {
      data: pbfts,
      total,
    };
  }

  public async getTransactions(
    address: string,
    filterDto: PaginationDto
  ): Promise<TransactionsPaginate> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    const take = Number(filterDto.take);
    const skip = Number(filterDto.skip);
    const page = skip === 0 ? skip : Math.floor(skip / take);

    const growthFactor = 5;
    const parsedAddress = toChecksumAddress(address);

    const query = `
        SELECT t.id, t.hash, t.from, t.to, t.status, t.value, t."gasUsed", t."gasPrice", t."blockNumber" as block, t."blockTimestamp" as age
        FROM ${this.txRepository.metadata.tableName} t
        WHERE t.from = $1 OR t.to = $1
        ORDER BY t.id DESC
        LIMIT $2 OFFSET $3`;

    const res = await this.txRepository.query(query, [
      parsedAddress,
      Number(take) + growthFactor, // always return growthFactor more to show next btn in pagination
      skip,
    ]);

    const total =
      res.length <= take
        ? res.length + take * page
        : (take + growthFactor) * (page + 1);

    const txes = [...res];
    if (res.length > take) {
      // Remove last growthFactor (elements) from array
      txes.splice(-growthFactor, growthFactor);
    }

    return {
      data: txes,
      total,
    };
  }
}
