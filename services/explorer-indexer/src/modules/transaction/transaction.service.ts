import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPBFT, ITransaction } from '@taraxa_project/taraxa-models';
import { Repository } from 'typeorm';
import { PbftEntity } from '../pbft';
import TransactionEntity from './transaction.entity';

export interface RPCTransaction {
  blockHash?: string;
  blockNumber?: string; //hex
  from?: string;
  to?: string;
  gas?: string; //hex
  gasPrice?: string; //hex
  hash: string;
  input?: string;
  nonce?: string; //hex
  r?: string;
  v?: string; // hex
  s?: string;
  transactionIndex?: string; //hex
  value?: string; //hex
}

@Injectable()
export default class TransactionService {
  private readonly logger: Logger = new Logger(TransactionService.name);
  constructor(
    @InjectRepository(TransactionEntity)
    private txRepository: Repository<TransactionEntity>
  ) {
    this.txRepository = txRepository;
  }

  public populateTransactionWithPBFT(tx: ITransaction, block: IPBFT) {
    tx.block = block;
    return tx;
  }

  public txRpcToITransaction(rpcTx: RPCTransaction) {
    const nonce = parseInt(rpcTx.nonce, 16);
    const iTx: ITransaction = {
      ...rpcTx,
      nonce,
    };
    return iTx;
  }

  public async clearTransactionData() {
    await this.txRepository.query('DELETE FROM "transactions"');
  }

  public async findTransactionsByHashesOrFill(transactions: ITransaction[]) {
    if (!(transactions?.length > 0)) {
      return [];
    }
    const newTransactions: TransactionEntity[] = [];
    await Promise.all(
      transactions.map(async (transaction) => {
        const tx = await this.safeSaveEmptyTx(transaction);
        newTransactions.push(tx);
      })
    );
    // for (const transaction of transactions) {
    //   const tx = await this.safeSaveEmptyTx(transaction);
    //   newTransactions.push(tx);
    // }
    return newTransactions;
  }

  public async safeSaveTx(transaction: ITransaction) {
    if (!transaction || !transaction.hash) {
      return;
    }

    const tx = await this.txRepository.findOne({
      where: {
        hash: transaction.hash,
      },
    });
    const block = transaction.block as PbftEntity;
    delete block.transactions;

    if (!tx) {
      try {
        const newTx = this.txRepository.create({
          hash: transaction.hash,
          nonce: transaction.nonce,
          index: transaction.index,
          value: transaction.value,
          gas: String(parseInt(transaction.gas, 16) || '0'),
          gasPrice: String(parseInt(transaction.gasPrice, 16) || '0'),
          gasUsed: String(parseInt(transaction.gasUsed, 16) || '0'),
          cumulativeGasUsed: transaction.cumulativeGasUsed,
          inputData: transaction.inputData,
          status: transaction.status,
          from: transaction.from,
          to: transaction.to,
          block: {
            id: transaction?.block?.id,
            hash: transaction.block.hash,
            number: transaction.block.number,
            timestamp: transaction.block.timestamp,
          },
        });
        // newTx = await this.txRepository.save(newTx);

        const saved = await this.txRepository
          .createQueryBuilder()
          .insert()
          .into(TransactionEntity)
          .values(newTx)
          .orUpdate(['hash'], 'UQ_6f30cde2f4cf5a630e053758400')
          .setParameter('hash', newTx.hash)
          .returning('*')
          .execute();

        if (saved?.raw[0]) {
          this.logger.log(
            `Registered new Transaction ${JSON.stringify(saved.raw[0]?.hash)}`
          );
        }
        return saved.raw[0];
      } catch (error) {
        console.error(error);
      }
    }
    return tx;
  }

  public async safeSaveEmptyTx(transaction: ITransaction) {
    if (!transaction) {
      return;
    }

    const tx = await this.txRepository.findOne({
      where: {
        hash: transaction.hash,
      },
    });

    if (!tx) {
      try {
        const transactionEntity = new TransactionEntity({
          ...transaction,
          block: {
            id: transaction?.block?.id,
            hash: transaction.block.hash,
            number: transaction.block.number,
            timestamp: transaction.block.timestamp,
          },
        });
        const newTx = this.txRepository.create(transactionEntity);

        const saved = await this.txRepository
          .createQueryBuilder()
          .insert()
          .into(TransactionEntity)
          .values(newTx)
          .orUpdate(['hash'], 'UQ_6f30cde2f4cf5a630e053758400')
          .setParameter('hash', newTx.hash)
          .returning('*')
          .execute();

        if (saved.raw[0]) {
          this.logger.log(
            `Registered new Transaction ${JSON.stringify(saved.raw[0]?.hash)}`
          );
        }
        return saved.raw[0];
      } catch (error) {
        console.error(error);
      }
    }
    return tx;
  }
}
