import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IDAG, ITransaction } from '@taraxa_project/taraxa-models';
import { NewDagBlockResponse, NewDagBlockFinalizedResponse } from 'src/types';
import { zeroX } from 'src/utils';
import { Repository } from 'typeorm';
import TransactionService from '../transaction/transaction.service';
import { DagEntity } from './dag.entity';

@Injectable()
export default class DagService {
  private readonly logger: Logger = new Logger(DagService.name);
  constructor(
    @InjectRepository(DagEntity)
    private dagRepository: Repository<DagEntity>,
    private txService: TransactionService
  ) {
    this.dagRepository = dagRepository;
  }

  private async safeSaveDag(dag: IDAG) {
    const txes = await this.txService.findTransactionsByHashesOrFill(
      dag.transactions
    );

    let newDag = await this.dagRepository.findOneBy({
      hash: zeroX(dag.hash),
    });
    if (newDag) {
      Object.assign(newDag, dag);
      newDag.transactions = txes;
    } else {
      newDag = this.dagRepository.create({ ...dag, transactions: txes });
    }
    if (!newDag.transactions) {
      newDag.transactions = [];
    }

    try {
      const saved = await this.dagRepository
        .createQueryBuilder()
        .insert()
        .into(DagEntity)
        .values(newDag)
        .orUpdate(['hash'], 'UQ_3928cee78a30b23a175d50796b2')
        .setParameter('hash', newDag.hash)
        .returning('*')
        .execute();
      if (saved) {
        this.logger.log(`Registered new DAG ${newDag.hash}`);
      }

      return saved;
    } catch (error) {
      console.error(`DAG ${newDag.hash} could not be saved: `, error);
    }
  }

  public dagRpcToIDAG(dag: NewDagBlockResponse) {
    const {
      hash,
      pivot,
      tips,
      level,
      period,
      timestamp,
      author,
      signature,
      vdf,
      transactionCount,
      transactions,
    } = { ...dag };

    const _dag = {
      hash,
      pivot: zeroX(pivot),
      tips: tips,
      level: parseInt(`${level}`, 16) || 0,
      pbftPeriod: period,
      timestamp: parseInt(timestamp, 16) || 0,
      author: zeroX(author),
      signature: zeroX(signature),
      vdf: parseInt(vdf?.difficulty, 16) || 0,
      transactionCount: transactionCount,
      transactions: transactions?.map((tx) => ({ hash: tx } as ITransaction)),
    };
    return _dag;
  }

  public async clearDagData() {
    await this.dagRepository.query('DELETE FROM "dags"');
  }

  public async getBlockByLevel(level: number) {
    return await this.dagRepository.findOneBy({ level });
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
    ).hash;
  }

  public async handleNewDag(dagData: NewDagBlockResponse) {
    const _dagObject = this.dagRpcToIDAG(dagData);

    try {
      await this.safeSaveDag(_dagObject);
    } catch (error) {
      console.error('handleNewDag', error);
    }
  }

  public async updateDag(updateData: NewDagBlockFinalizedResponse) {
    let dag;

    dag = await this.dagRepository.findOneBy({ hash: zeroX(updateData.block) });
    if (!dag) {
      dag = new DagEntity();
      dag.hash = zeroX(updateData.block);
    }
    dag.pbftPeriod = parseInt(updateData.period, 10);
    try {
      const updated = await this.dagRepository.save(dag);
      if (updated) this.logger.log(`DAG ${updateData.block} finalized`);
    } catch (error) {
      console.error('NewDagBlockFinalizedResponse');
      console.error(error);
    }
  }
}
