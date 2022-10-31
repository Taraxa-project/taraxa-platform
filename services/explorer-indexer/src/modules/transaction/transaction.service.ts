import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPBFT,
  ITransaction,
  PbftEntity,
  toChecksumAddress,
  TransactionEntity,
  zeroX,
} from '@taraxa_project/explorer-shared';
import { IGQLTransaction } from 'src/types';
import { Repository } from 'typeorm';

@Injectable()
export default class TransactionService {
  private readonly logger: Logger = new Logger(TransactionService.name);
  constructor(
    @InjectRepository(TransactionEntity)
    private txRepository: Repository<TransactionEntity>
  ) {
    this.txRepository = txRepository;
  }

  public async deleteTransactions(transactions: TransactionEntity[]) {
    return await this.txRepository.remove(transactions);
  }

  public populateTransactionWithPBFT(tx: ITransaction, block: IPBFT) {
    tx.block = block;
    return tx;
  }

  public gQLToITransaction(gqlTx: IGQLTransaction): ITransaction {
    const iTx: ITransaction = {
      ...gqlTx,
      to: zeroX(gqlTx.to?.address),
      inputData: zeroX(gqlTx.inputData),
      from: zeroX(gqlTx.from?.address),
      nonce: Number(gqlTx.nonce || null),
      blockHash: zeroX(gqlTx.block?.hash),
      blockNumber: gqlTx.block?.number + '',
      transactionIndex: gqlTx.index + '',
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
    return newTransactions;
  }

  public async safeSaveEmptyTx(transaction: ITransaction) {
    if (!transaction) {
      return;
    }
    transaction.hash = zeroX(transaction.hash);

    const tx = await this.txRepository.findOne({
      where: {
        hash: transaction.hash,
      },
    });

    if (!tx) {
      try {
        const transactionEntity = new TransactionEntity({
          ...transaction,
        });
        if (transaction.from) {
          transactionEntity.from = toChecksumAddress(transaction.from);
        }
        if (transaction.to) {
          transactionEntity.to = toChecksumAddress(transaction.to);
        }
        if (transaction?.block) {
          transactionEntity.block = {
            id: transaction?.block?.id,
            hash: transaction.block?.hash,
            number: transaction.block?.number,
            timestamp: transaction.block?.timestamp,
          } as PbftEntity;
        }
        const newTx = this.txRepository.create(transactionEntity);

        const saved = await this.txRepository
          .createQueryBuilder()
          .insert()
          .into(TransactionEntity)
          .values(newTx)
          .orIgnore()
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
