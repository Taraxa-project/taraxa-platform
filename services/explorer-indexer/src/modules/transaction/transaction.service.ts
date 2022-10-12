import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransaction } from '@taraxa_project/taraxa-models';
import { Repository } from 'typeorm';
import TransactionEntity from './transaction.entity';

@Injectable()
export default class TransactionService {
  private readonly logger: Logger = new Logger(TransactionService.name);
  constructor(
    @InjectRepository(TransactionEntity)
    private txRepository: Repository<TransactionEntity>
  ) {
    this.txRepository = txRepository;
  }

  public async clearTransactionData() {
    await this.txRepository.query('DELETE FROM "transactions"');
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

    const tx = await this.txRepository.findOne({
      where: {
        hash,
      },
    });

    if (!tx) {
      try {
        const newTx = this.txRepository.create({ hash });
        // newTx = await this.txRepository.save(newTx);
        if (newTx) {
          this.logger.log(`Registered new Transaction ${newTx.hash}`);
        }

        const saved = await this.txRepository
          .createQueryBuilder()
          .insert()
          .into(TransactionEntity)
          .values(newTx)
          .orUpdate(['hash'], 'UQ_6f30cde2f4cf5a630e053758400')
          .setParameter('hash', hash)
          .execute();

        if (saved) {
          this.logger.log(`Registered new Transaction ${newTx.hash}`);
        }
        return saved.raw[0];
      } catch (error) {
        console.error(error);
      }
    }
    return tx;
  }
}
