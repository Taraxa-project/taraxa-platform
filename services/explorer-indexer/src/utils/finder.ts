import { Logger } from '@nestjs/common';
import { IPBFT } from '@taraxa_project/taraxa-models';
import { PbftEntity } from 'src/modules';
import TransactionEntity from 'src/modules/transaction/transaction.entity';
import { Repository } from 'typeorm';
import util from 'util';

export const safeSaveTx = async (
  hash: string,
  repository: Repository<TransactionEntity>,
  logger: Logger
) => {
  let tx = await repository.findOne({
    relations: {
      dagBlocks: true,
    },
    where: {
      hash,
    },
  });
  if (!tx) {
    tx = new TransactionEntity();
    tx.hash = hash;
    try {
      tx = await repository.save(tx);
    } catch (error) {
      logger.warn(error);
      logger.warn(`Skipping saving transaction: ${util.inspect(tx)}`);
      console.warn(`Skipping saving transaction: ${util.inspect(tx)}`);
    }
  }
  return tx;
};

export const safeSavePbft = async (
  pbft: IPBFT,
  repository: Repository<PbftEntity>,
  logger: Logger
) => {
  let _pbft = await repository.findOne({
    relations: {
      transactions: true,
    },
    where: {
      hash: pbft.hash,
    },
  });
  if (!_pbft) {
    _pbft = new PbftEntity(pbft);
    try {
      _pbft = await repository.save(_pbft);
    } catch (error) {
      logger.warn(error);
      logger.warn(`Skipping saving pbft: ${util.inspect(pbft)}`);
      console.warn(`Skipping saving pbft: ${util.inspect(pbft)}`);
    }
  }
  return _pbft;
};

export const findTransactionsByHashesOrFill = async (
  hashes: string[],
  repository: Repository<TransactionEntity>,
  logger: Logger
) => {
  return hashes
    ? await Promise.all(
        hashes.map(async (hash) => {
          return await safeSaveTx(hash, repository, logger);
        })
      )
    : [];
};
