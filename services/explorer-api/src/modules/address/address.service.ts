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
  TransactionResponse,
  BlocksCount,
  AddressDetailsResponse,
} from './responses';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';

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
      `SELECT COUNT(distinct hash) as pbfts_mined from ${this.pbftRepository.metadata.tableName} WHERE LOWER(miner) = lower('${parsedAddress}')`
    );
    const [{ dags_mined }] = await this.pbftRepository.query(
      `SELECT COUNT(distinct hash) as dags_mined from ${this.dagRepository.metadata.tableName}  WHERE LOWER(author) = lower('${parsedAddress}')`
    );

    return {
      dags: dags_mined,
      pbft: pbfts_mined,
    };
  }

  public async getDags(address: string): Promise<DagEntity[]> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    return await this.dagRepository.find({
      select: ['timestamp', 'level', 'hash', 'transactionCount'],
      where: {
        author: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
          address,
        }),
      },
    });
  }

  public async getPbfts(address: string): Promise<PbftEntity[]> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    return await this.pbftRepository.find({
      select: ['timestamp', 'number', 'hash', 'transactionCount'],
      where: {
        miner: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
          address,
        }),
      },
    });
  }

  public async getTransactions(
    address: string
  ): Promise<TransactionResponse[]> {
    if (!isAddress(address)) throw new BadRequestException('Invalid Address!');
    const parsedAddress = toChecksumAddress(address);
    // Don't test with Swagger as it will break
    const res = await this.txRepository.query(
      `SELECT t.hash, t.from, t.to, t.status, t.value, t."gasUsed", t."gasPrice", p.number as block, p.timestamp as age from ${this.txRepository.metadata.tableName} t LEFT JOIN ${this.pbftRepository.metadata.tableName} p ON t."blockId" = p.id WHERE LOWER(t.from) = LOWER('${parsedAddress}') or LOWER(t.to) = LOWER('${parsedAddress}')`
    );

    return res;
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
      const [{ total_sent }] = await this.txRepository.query(
        `select sum(value::REAL) as total_sent from ${this.txRepository.metadata.tableName} where lower(${this.txRepository.metadata.tableName}.from) = lower('${parsedAddress}');`
      );
      const [{ total_received }] = await this.txRepository.query(
        `select sum(value::REAL) as total_received from ${this.txRepository.metadata.tableName} where lower(${this.txRepository.metadata.tableName}.to) = lower('${parsedAddress}');`
      );
      const [{ total_mined }] = await this.txRepository.query(
        `select sum(reward::REAL) as total_mined from ${this.pbftRepository.metadata.tableName} where lower(miner) = lower('${parsedAddress}');`
      );
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
    try {
      const realTimePrice = await firstValueFrom(
        this.httpService
          .get(this.configService.get<string>('general.tokenPriceURL'))
          .pipe(
            catchError(() => {
              throw new ForbiddenException('API not available');
            })
          )
          .pipe(
            map((res: AxiosResponse) => {
              return res.data;
            })
          )
      );
      price = realTimePrice[0].current_price as number;
      currentValue = +fromWei(balance, 'ether') * price;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Fetching details unsuccessful. Please try again later.'
      );
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
