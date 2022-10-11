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
      const newTx = new TransactionEntity();
      newTx.hash = hash;
      try {
        // const saved = await this.txRepository.save(newTx);

        const saved = await this.txRepository
          .createQueryBuilder()
          .insert()
          .into(TransactionEntity)
          .values({ hash })
          .orUpdate(['hash'], 'UQ_6f30cde2f4cf5a630e053758400')
          .setParameter('hash', hash)
          .execute();

        if (saved) {
          this.logger.log(`Registered new Transaction ${newTx.hash}`);
        }
        return saved.raw[0];
      } catch (err) {
        console.error('Cannot save transaction: ', err);
      }
    }
    return tx;
  }
}
