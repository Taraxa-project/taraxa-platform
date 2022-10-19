import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IDAG,
  ITransaction,
  zeroX,
  toChecksumAddress,
} from '@taraxa_project/explorer-shared';
import { NewDagBlockResponse, NewDagBlockFinalizedResponse } from 'src/types';
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
      newDag.author = dag.author ? toChecksumAddress(dag.author) : null;
    } else {
      newDag = this.dagRepository.create({
        ...dag,
        transactions: [],
        author: dag.author ? toChecksumAddress(dag.author) : null,
      });
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
        const savedDag = saved.raw[0];
        this.logger.log(`Registered new DAG ${savedDag.hash}`);
        if (txes?.length > 0) {
          const currentDag = await this.dagRepository.findOneBy({
            hash: zeroX(savedDag.hash),
          });
          await this.dagRepository
            .createQueryBuilder()
            .relation(DagEntity, 'transactions')
            .of(currentDag)
            .add(txes);
        }
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
      sender,
      signature,
      sig,
      vdf,
      transactionCount,
      transactions,
    } = { ...dag };
    console.log('DAG: ', dag);
    const _dag = {
      hash,
      pivot: zeroX(pivot),
      tips: tips,
      level: parseInt(`${level}`, 16) || 0,
      pbftPeriod: period,
      timestamp: parseInt(timestamp, 16) || 0,
      author: toChecksumAddress(zeroX(sender || author)),
      signature: zeroX(sig || signature),
      vdf: parseInt(vdf?.difficulty, 16) || 0,
      transactionCount: transactionCount || transactions?.length || 0,
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
      const res = await this.safeSaveDag(_dagObject);
      if (res) {
        this.logger.log(`Saved new DAG ${dagData.hash}`);
        console.log(`Saved new DAG ${dagData.hash}`);
      }
    } catch (error) {
      this.logger.error('handleNewDag', error);
      console.error('handleNewDag', error);
    }
  }

  public async updateDag(updateData: NewDagBlockFinalizedResponse) {
    const dag = new DagEntity();
    dag.hash = zeroX(updateData.block);
    dag.pbftPeriod = parseInt(updateData.period, 10);
    try {
      const updated = await this.safeSaveDag(dag);
      console.log(' dag updated: ', updated);
      if (updated) {
        this.logger.log(`DAG ${updateData.block} finalized`);
        console.log(`DAG ${updateData.block} finalized`);
      }
    } catch (error) {
      this.logger.error('NewDagBlockFinalizedResponse', error);
      console.error('NewDagBlockFinalizedResponse', error);
    }
  }
}
