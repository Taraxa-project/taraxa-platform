import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransaction } from '@taraxa_project/taraxa-models';
import { safeSaveTx } from 'src/utils';
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
    return await safeSaveTx(transaction.hash, this.txRepository, this.logger);
  }
}
