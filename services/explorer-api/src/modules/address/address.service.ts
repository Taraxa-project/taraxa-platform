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
import { fromWei, isAddress, toBN, toWei } from 'web3-utils';
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
      .orderBy('timestamp', 'ASC');

    this.logger.log(query.getSql());

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
        author: Raw((alias) => `LOWER(${alias}) = LOWER(:parsedAddress)`, {
          parsedAddress,
        }),
      },
      order: {
        hash: 'ASC',
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
        miner: Raw((alias) => `LOWER(${alias}) = LOWER(:parsedAddress)`, {
          parsedAddress,
        }),
      },
      order: {
        hash: 'ASC',
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
    const parsedAddress = toChecksumAddress(address);

    const totalQuery = `SELECT COUNT(*) as total
      FROM ${this.txRepository.metadata.tableName} t
      INNER JOIN ${this.pbftRepository.metadata.tableName} p ON t."blockId" = p.id
      WHERE t.from = $1 OR t.to = $1`;

    const totalRes = await this.txRepository.query(totalQuery, [parsedAddress]);
    if (totalRes[0].total > 0) {
      const query = `
        SELECT t.hash, t.from, t.to, t.status, t.value, t."gasUsed", t."gasPrice", p.number as block, p.timestamp as age
        FROM ${this.txRepository.metadata.tableName} t
        INNER JOIN ${this.pbftRepository.metadata.tableName} p ON t."blockId" = p.id
        WHERE t.from = $1 OR t.to = $1
        ORDER BY t.hash
        LIMIT $2 OFFSET $3`;
      const res = await this.txRepository.query(query, [
        parsedAddress,
        take,
        skip,
      ]);
      return {
        data: res,
        total: totalRes[0].total,
      };
    } else {
      return {
        data: [],
        total: 0,
      };
    }
  }

  public async getDetails(address: string): Promise<AddressDetailsResponse> {
    if (!address) {
      throw new BadRequestException('Address not supplied!');
    }
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    const parsedAddress = toChecksumAddress(address);
    let balance = toBN('0');
    let totalSent = toBN('0');
    let totalReceived = toBN('0');

    try {
      const totalSentPromise = this.txRepository.query(
        `select cast(sum(value::REAL) as numeric) as total_sent from ${this.txRepository.metadata.tableName} where lower(${this.txRepository.metadata.tableName}.from) = lower('${parsedAddress}');`
      );
      const totalReceivedPromise = this.txRepository.query(
        `select cast(sum(value::REAL) as numeric) as total_received from ${this.txRepository.metadata.tableName} where lower(${this.txRepository.metadata.tableName}.to) = lower('${parsedAddress}');`
      );
      const totalMinedPromise = this.txRepository.query(
        `select cast(sum(reward::REAL) as numeric) as total_mined from ${this.pbftRepository.metadata.tableName} where lower(miner) = lower('${parsedAddress}');`
      );

      const [[{ total_sent }], [{ total_received }], [{ total_mined }]] =
        await Promise.all([
          totalSentPromise,
          totalReceivedPromise,
          totalMinedPromise,
        ]);

      const padSentToWei = toWei(String(total_sent || '0'), 'ether');
      const padReceivedToWei = toWei(String(total_received || '0'), 'ether');
      totalSent = toBN(padSentToWei);
      totalReceived = toBN(padReceivedToWei);
      const fromScietificToString =
        Intl.NumberFormat('en-US').format(total_mined);
      const clear = fromScietificToString.replace(/\D+/g, '');
      const totalMined = toBN(`${clear}` || '0');
      balance = balance.add(totalMined);
      balance = balance.add(totalReceived);
      balance = balance.sub(totalSent);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Fetching details unsuccessful. Please try again later.'
      );
    }

    let price = 0;
    let currentValue = 0;
    const url = this.configService.get<string>('general.tokenPriceURL');
    try {
      const headersRequest = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress',
      };
      const realTimePrice = await firstValueFrom(
        this.httpService.get(url, { headers: headersRequest }).pipe(
          map((resp: AxiosResponse) => {
            return resp.data;
          }),
          catchError((err: any) => {
            this.logger.error(`Error calling Token API: ${err}`);
            throw new ForbiddenException('API not available');
          })
        )
      );
      price = realTimePrice[0].current_price as number;
      currentValue = +fromWei(balance, 'ether') * price;
    } catch (error) {
      this.logger.error(error);
    }
    return {
      totalSent: totalSent.toString(),
      totalReceived: totalReceived.toString(),
      priceAtTimeOfCalculation: price.toFixed(6).toString(),
      currentBalance: balance.toString(),
      currentValue: currentValue.toString(),
      currency: 'USD',
    };
  }
}
