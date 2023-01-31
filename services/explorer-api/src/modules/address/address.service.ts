import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Raw, Repository } from 'typeorm';
import { fromWei, isAddress, toBN } from 'web3-utils';
import {
  PbftEntity,
  DagEntity,
  TransactionEntity,
  toChecksumAddress,
} from '@taraxa_project/explorer-shared';
import {
  StatsResponse,
  BlocksCount,
  AddressDetailsResponse,
  TransactionsPaginate,
  PbftsPaginate,
  DagsPaginate,
} from './responses';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
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
    private txRepository: Repository<TransactionEntity>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
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
      `SELECT COUNT(hash) as pbfts_mined from ${this.pbftRepository.metadata.tableName} WHERE LOWER(miner) = lower('${parsedAddress}') GROUP BY miner;`
    );
    const [{ dags_mined }] = await this.pbftRepository.query(
      `SELECT COUNT(hash) as dags_mined from ${this.dagRepository.metadata.tableName}  WHERE LOWER(author) = lower('${parsedAddress}') GROUP BY author;`
    );

    return {
      dags: dags_mined,
      pbft: pbfts_mined,
    };
  }

  public async getDags(
    address: string,
    filterDto: PaginationDto
  ): Promise<DagsPaginate> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    const { take, skip } = filterDto;
    const parsedAddress = toChecksumAddress(address);
    const [data, total] = await this.dagRepository.findAndCount({
      select: ['timestamp', 'level', 'hash', 'transactionCount'],
      where: {
        author: Raw((alias) => `${alias} = :parsedAddress`, {
          parsedAddress,
        }),
      },
      order: {
        timestamp: 'DESC',
      },
      take,
      skip,
    });
    return {
      data: data,
      total: total,
    };
  }

  public async getPbfts(
    address: string,
    filterDto: PaginationDto
  ): Promise<PbftsPaginate> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    const { take, skip } = filterDto;
    const parsedAddress = toChecksumAddress(address);
    const [data, total] = await this.pbftRepository.findAndCount({
      select: ['timestamp', 'number', 'hash', 'transactionCount'],
      where: {
        miner: Raw((alias) => `${alias} = :parsedAddress`, {
          parsedAddress,
        }),
      },
      order: {
        timestamp: 'DESC',
      },
      take,
      skip,
    });
    return {
      data: data,
      total: total,
    };
  }

  public async getTransactions(
    address: string,
    filterDto: PaginationDto
  ): Promise<TransactionsPaginate> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    const { take, skip } = filterDto;
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
    // Remove last growthFactor (elements) from array
    const txes = res;
    txes.splice(-growthFactor, growthFactor);
    return {
      data: txes,
      total: res.length >= take ? res.length + growthFactor : res.length,
    };
  }
}
