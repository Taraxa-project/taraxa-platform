import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransaction } from '@taraxa_project/taraxa-models';
import { Repository, InsertResult } from 'typeorm';
import TransactionEntity from './transaction.entity';
import util from 'util';

@Injectable()
export default class TransactionService {
  private readonly logger: Logger = new Logger(TransactionService.name);
  constructor(
    @InjectRepository(TransactionEntity)
    private txRepository: Repository<TransactionEntity>
  ) {
    this.txRepository = txRepository;
  }

  public async safeSaveTransaction(transaction: ITransaction) {
    return await this.safeSaveTx(transaction.hash);
  }

  public async findTransactionsByHashesOrFill(hashes: string[]) {
    if (!(hashes?.length > 0)) {
      return [];
    }
    const cleanHashes = Array.from(new Set(hashes));
    const transactions: TransactionEntity[] = [];
    for (const cleanHash of cleanHashes) {
      const tx = await this.safeSaveTx(cleanHash);
      transactions.push(tx);
    }

    return transactions;
  }

  public async safeSaveTx(hash: string) {
    if (!hash) {
      return;
    }
    // const tx = this.txRepository
    //   .createQueryBuilder('tx')
    //   .select('tx.hash')
    //   .where('LOWER("tx"."hash") = LOWER(:hash)', { hash })
    //   .getOne();

    const tx = await this.txRepository.findOne({
      where: {
        hash,
      },
    });

    if (!tx) {
      const newTx = await this.txRepository.save({ hash });
      // const newTx = await this.txRepository
      //   .createQueryBuilder()
      //   .insert()
      //   .into(TransactionEntity)
      //   .values([{ hash }])
      //   .execute();

      console.log('newTx: ', newTx);
      return newTx;
      // try {
      //   // let newTx = this.txRepository.create({ hash });
      //   const newTx = await this.txRepository.save({ hash });
      //   console.log('newTx: ', newTx);
      //   return newTx;
      // } catch (err) {
      //   console.error('Cannot save transaction: ', err);
      // }
    }
    return tx;
  }
}
