import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewDagBlockResponse, NewDagBlockFinalizedResponse } from 'src/types';
import { findTransactionsByHashesOrFill, zeroX } from 'src/utils';
import { Repository } from 'typeorm';
import TransactionEntity from '../transaction/transaction.entity';
import { DagEntity } from './dag.entity';

@Injectable()
export default class DagService {
  private readonly logger: Logger = new Logger(DagService.name);
  constructor(
    @InjectRepository(DagEntity)
    private dagRepository: Repository<DagEntity>,
    @InjectRepository(TransactionEntity)
    private txRepository: Repository<TransactionEntity>
  ) {
    this.dagRepository = dagRepository;
  }

  public async getLastDagHash() {
    return (
      await this.dagRepository
        .createQueryBuilder('dags')
        .select()
        .orderBy('dags.timestamp', 'DESC')
        .limit(1)
        .getOne()
    ).hash;
  }

  public async handleNewDag(dagData: NewDagBlockResponse) {
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
    } = { ...dagData };

    const txes = await findTransactionsByHashesOrFill(
      transactions,
      this.txRepository,
      this.logger
    );
    let newDag = await this.dagRepository.findOneBy({ hash: zeroX(hash) });
    if (newDag) {
      newDag.pivot = zeroX(pivot);
      newDag.tips = tips;
      newDag.level = parseInt(`${level}`, 16) || 0;
      newDag.pbftPeriod = period;
      newDag.timestamp = parseInt(timestamp, 16) || 0;
      newDag.author = zeroX(author);
      newDag.signature = zeroX(signature);
      newDag.vdf = parseInt(vdf?.difficulty, 16) || 0;
      newDag.transactionCount = transactionCount;
      newDag.transactions = txes;
    } else {
      newDag = new DagEntity({
        hash: zeroX(hash),
        pivot: zeroX(pivot),
        tips,
        level: parseInt(`${level}`, 16) || 0,
        pbftPeriod: period,
        timestamp: parseInt(timestamp, 16) || 0,
        author: zeroX(author),
        signature: zeroX(signature),
        vdf: parseInt(vdf?.difficulty, 16) || 0,
        transactionCount,
        transactions: txes,
      });
    }
    try {
      const saved = await this.dagRepository.save(newDag);
      if (saved) {
        this.logger.log(`Registered new DAG ${saved.hash}`);
      }

      return saved;
    } catch (error) {
      console.error('handleNewDag');
      console.error(error);
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
