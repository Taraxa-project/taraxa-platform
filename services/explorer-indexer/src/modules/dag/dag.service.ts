import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IDAG,
  zeroX,
  toChecksumAddress,
  DagEntity,
} from '@taraxa_project/explorer-shared';
import { IGQLDag } from 'src/types';
import { Repository } from 'typeorm';
import TransactionService from '../transaction/transaction.service';

@Injectable()
export default class DagService {
  private readonly logger: Logger = new Logger(DagService.name);
  private isRedisConnected: boolean;
  constructor(
    @InjectRepository(DagEntity)
    private dagRepository: Repository<DagEntity>,
    private txService: TransactionService
  ) {
    this.dagRepository = dagRepository;
    this.isRedisConnected = true;
  }

  public getRedisConnectionState() {
    return this.isRedisConnected;
  }

  public setRedisConnectionState(state: boolean) {
    this.isRedisConnected = state;
  }

  public async safeSaveDag(dag: IDAG) {
    const txes = await this.txService.findTransactionsByHashesOrFill(
      dag.transactions
    );
    const dagExists = await this.dagRepository.findOneBy({
      hash: zeroX(dag.hash),
    });
    if (dagExists) {
      dagExists.pivot = dag.pivot || dagExists.pivot;
      dagExists.tips = dag.tips || dagExists.tips;
      dagExists.level = dag.level || dagExists.level;
      dagExists.pbftPeriod = dag.pbftPeriod || dagExists.pbftPeriod;
      dagExists.timestamp = dag.timestamp || dagExists.timestamp;
      dagExists.signature = dag.signature || dagExists.signature;
      dagExists.vdf = dag.vdf || dagExists.vdf;
      dagExists.author = dag.author
        ? toChecksumAddress(dag.author)
        : dagExists.author;
      if (dagExists.transactions?.length > 0) {
        dagExists.transactions = Array.from(
          new Set([...dagExists.transactions, ...txes])
        );
      } else {
        dagExists.transactions = txes;
      }
      return await this.saveDagToDB(dagExists);
    } else {
      const newDag = this.dagRepository.create({
        ...dag,
        transactions: txes || [],
        author: dag.author ? toChecksumAddress(dag.author) : null,
      });
      return await this.saveDagToDB(newDag);
    }
  }

  private async saveDagToDB(dagToCreate: DagEntity) {
    if (!dagToCreate) {
      return;
    }
    try {
      const savedDag = await dagToCreate.save();
      this.logger.log(`Registered new DAG ${savedDag.hash}`);
      return savedDag;
    } catch (err) {
      this.logger.error(
        `Failed to save or update DAG with hash: ${dagToCreate.hash}`
      );
      this.logger.error(`Reason is: ${err}`);
    }
  }

  public dagGraphQlToIdag(dag: IGQLDag) {
    const {
      hash,
      pivot,
      tips,
      level,
      pbftPeriod,
      timestamp,
      author,
      signature,
      vdf,
      transactionCount,
      transactions,
    } = dag;
    const _dag: IDAG = {
      hash: zeroX(hash),
      pivot: zeroX(pivot),
      tips: tips,
      level: parseInt(`${level}`, 16) || 0,
      pbftPeriod,
      timestamp,
      author: author.address ? toChecksumAddress(zeroX(author.address)) : null,
      signature: zeroX(signature),
      vdf,
      transactionCount: transactionCount || transactions?.length || 0,
      transactions: transactions?.map((tx) =>
        this.txService.gQLToITransaction(tx)
      ),
    };
    return _dag;
  }

  public async clearDagData() {
    await this.dagRepository.query('DELETE FROM "dags"');
  }

  public async getBlockByLevel(level: number) {
    return await this.dagRepository.findOneBy({ level });
  }

  public async findAndRemoveDagsForPbftPeriod(period: number): Promise<void> {
    const dags = await this.dagRepository.find({
      where: {
        pbftPeriod: period,
      },
    });
    if (dags?.length > 0) {
      this.logger.debug(
        `Deleting ${dags?.length} DAGS with pbftPeriod ${period}`
      );
      await this.dagRepository.remove(dags);
      this.logger.debug(`Deleted ${dags?.length} DAGs`);
    }
  }

  public async getDagsFromLastLevel(limit: number) {
    return await this.dagRepository
      .createQueryBuilder('dags')
      .leftJoinAndSelect('dags.transactions', 'transactions')
      .select()
      .where('dags.level IS NOT NULL')
      .orderBy('dags.level', 'DESC')
      .limit(limit)
      .getMany();
  }

  public async getLastDagFromLastPbftPeriod(limit: number) {
    return await this.dagRepository
      .createQueryBuilder('dags')
      .leftJoinAndSelect('dags.transactions', 'transactions')
      .select()
      .where('dags.pbftPeriod IS NOT NULL')
      .orderBy('dags.pbftPeriod', 'DESC')
      .limit(limit)
      .getMany();
  }

  public async getLastDagHash() {
    return (
      await this.dagRepository
        .createQueryBuilder('dags')
        .leftJoinAndSelect('dags.transactions', 'transactions')
        .select()
        .orderBy('dags.timestamp', 'DESC')
        .limit(1)
        .getOne()
    )?.hash;
  }
}
