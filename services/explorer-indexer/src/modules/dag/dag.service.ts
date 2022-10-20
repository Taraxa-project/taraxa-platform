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
        dagExists.transactions = [...dagExists.transactions, ...txes];
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
    dag.pbftPeriod = parseInt(Number(updateData.period).toString(), 10);
    try {
      const updated = await this.safeSaveDag(dag);
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
