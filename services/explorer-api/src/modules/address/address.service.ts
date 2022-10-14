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
import { DagEntity, PbftEntity, TransactionEntity } from '../pbft';

export interface StatsResponse {
  totalProduced: number;
  firstBlockTimestamp: number;
  lastBlockTimestamp: number;
  rank: number;
  produced: number;
}

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

  public async getBlocksProduced(
    address: string
  ): Promise<{ dags: number; pbft: number }> {
    const [{ pbfts_mined }] = await this.pbftRepository.query(
      `SELECT COUNT(distinct hash) as pbfts_mined from pbfts WHERE LOWER(miner) = lower('${address}')`
    );
    const [{ dags_mined }] = await this.pbftRepository.query(
      `SELECT COUNT(distinct hash) as dags_mined from dags  WHERE LOWER(author) = lower('${address}')`
    );

    console.log('pbftQuery: ', pbfts_mined);
    console.log('dagQuery: ', dags_mined);

    return {
      dags: dags_mined,
      pbft: pbfts_mined,
    };
  }

  public async getDags(address: string): Promise<DagEntity[]> {
    return await this.dagRepository.find({
      where: {
        author: address,
      },
    });
  }

  public async getPbfts(address: string): Promise<PbftEntity[]> {
    return await this.pbftRepository.find({
      where: {
        miner: address,
      },
    });
  }

  public async getTransactions(address: string): Promise<TransactionEntity[]> {
    // Don't test with Swagger as it will break
    const res = await this.txRepository.query(
      `SELECT * FROM transactions WHERE LOWER(transactions.from) = LOWER('${address}') OR LOWER(transactions.to) = LOWER('${address}')`
    );

    return res;
  }
}
