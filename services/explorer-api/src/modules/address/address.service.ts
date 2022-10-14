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
import { Repository } from 'typeorm';
import { fromWei, toBN, toWei } from 'web3-utils';
import { DagEntity, PbftEntity, TransactionEntity } from '../pbft';
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
          const ranks = await this.pbftRepository.query(
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

  public async getBlocksProduced(address: string): Promise<BlocksCount> {
    const [{ pbfts_mined }] = await this.pbftRepository.query(
      `SELECT COUNT(distinct hash) as pbfts_mined from pbfts WHERE LOWER(miner) = lower('${address}')`
    );
    const [{ dags_mined }] = await this.pbftRepository.query(
      `SELECT COUNT(distinct hash) as dags_mined from dags  WHERE LOWER(author) = lower('${address}')`
    );

    return {
      dags: dags_mined,
      pbft: pbfts_mined,
    };
  }

  public async getDags(address: string): Promise<DagEntity[]> {
    return await this.dagRepository.find({
      select: ['timestamp', 'level', 'hash', 'transactionCount'],
      where: {
        author: address,
      },
    });
  }

  public async getPbfts(address: string): Promise<PbftEntity[]> {
    return await this.pbftRepository.find({
      select: ['timestamp', 'number', 'hash', 'transactionCount'],
      where: {
        miner: address,
      },
    });
  }

  public async getTransactions(
    address: string
  ): Promise<TransactionResponse[]> {
    // Don't test with Swagger as it will break
    const res = await this.txRepository.query(
      `SELECT t.hash, t.from, t.to, t.status, t.value, t."gasUsed", t."gasPrice", p.number as block, p.timestamp as age from transactions t LEFT JOIN pbfts p ON t."blockId" = p.id WHERE LOWER(t.from) = LOWER('${address}') or LOWER(t.to) = LOWER('${address}')`
    );

    return res;
  }

  public async getDetails(address: string): Promise<AddressDetailsResponse> {
    if (!address) throw new BadRequestException('Address not supplied!');
    let balance = toBN('0');
    try {
      const [{ total_sent }] = await this.txRepository.query(
        `select sum(value::REAL) as total_sent from transactions where lower(transactions.from) = lower('${address}');`
      );
      const [{ total_received }] = await this.txRepository.query(
        `select sum(value::REAL) as total_received from transactions where lower(transactions.to) = lower('${address}');`
      );
      const [{ total_mined }] = await this.txRepository.query(
        `select sum(reward::REAL) as total_mined from pbfts where lower(miner) = lower('${address}');`
      );
      const padSentToWei = toWei(String(total_sent || '0'), 'ether');
      const padReceivedToWei = toWei(String(total_received || '0'), 'ether');
      const totalSent = toBN(padSentToWei);
      const totalReceived = toBN(padReceivedToWei);
      const fromScietificToString =
        Intl.NumberFormat('en-US').format(total_mined);
      const clear = fromScietificToString.replace(/\D+/g, '');
      const totalMined = toBN(`${clear}` || '0');
      balance = balance.add(totalMined);
      balance = balance.add(totalReceived);
      balance = balance.sub(totalSent);

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
      const price = realTimePrice[0].current_price as number;
      const currentValue = +fromWei(balance, 'ether') * price;
      return {
        totalSent: totalSent.toString(),
        totalReceived: totalReceived.toString(),
        priceAtTimeOfCalculation: price.toFixed(6).toString(),
        currentBalance: balance.toString(),
        currentValue: currentValue.toString(),
        currency: 'USD',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Fetching details unsuccessful. Please try again later.'
      );
    }
  }
}
