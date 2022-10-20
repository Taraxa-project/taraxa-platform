import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPBFT,
  ITransaction,
  zeroX,
  toChecksumAddress,
} from '@taraxa_project/explorer-shared';
import {
  IGQLPBFT,
  NewPbftBlockHeaderResponse,
  NewPbftBlockResponse,
  RPCPbft,
} from 'src/types';
import { Repository } from 'typeorm';
import TransactionService from '../transaction/transaction.service';
import { PbftEntity } from './pbft.entity';

@Injectable()
export default class PbftService {
  private readonly logger: Logger = new Logger(PbftService.name);
  constructor(
    @InjectRepository(PbftEntity)
    private pbftRepository: Repository<PbftEntity>,
    private txService: TransactionService
  ) {
    this.pbftRepository = pbftRepository;
  }

  private updateValuesForPbft = async (pbftData: NewPbftBlockResponse) => {
    const { block_hash, period, timestamp, beneficiary } = {
      ...pbftData?.pbft_block,
    };
    const existing = await this.pbftRepository.findOneBy({
      hash: zeroX(block_hash),
    });
    if (existing) {
      existing.number = period;
      existing.timestamp = timestamp;
      existing.miner = toChecksumAddress(beneficiary);
      return existing;
    } else {
      const pbft: IPBFT = {
        hash: zeroX(block_hash),
        number: period || 0,
        timestamp: timestamp || 0,
        miner: toChecksumAddress(zeroX(beneficiary)),
      };
      return pbft;
    }
  };

  public async safeSavePbft(pbft: IPBFT) {
    if (!pbft || !pbft.hash) {
      return;
    }
    let _pbft;
    try {
      _pbft = await this.pbftRepository.findOneBy({ hash: pbft.hash });
      if (!_pbft) {
        const newPbft = this.pbftRepository.create({
          hash: pbft.hash,
          miner: toChecksumAddress(pbft.miner),
          number: pbft.number,
          timestamp: pbft.timestamp,
          nonce: pbft.nonce,
          reward: pbft.reward,
          gasLimit: String(pbft.gasLimit || '0'),
          gasUsed: String(pbft.gasUsed || '0'),
          parent: pbft.parent,
          difficulty: pbft.difficulty,
          totalDifficulty: pbft.totalDifficulty,
          transactionCount: pbft.transactions?.length || pbft.transactionCount,
          extraData: pbft.extraData,
          logsBloom: pbft.logsBloom,
          mixHash: pbft.mixHash,
          recepitsRoot: pbft.recepitsRoot,
          sha3Uncles: pbft.sha3Uncles,
          size: pbft.size,
          stateRoot: pbft.stateRoot,
          transactionsRoot: pbft.transactionsRoot,
        });
        _pbft = newPbft;
      }

      const saved = await this.pbftRepository
        .createQueryBuilder()
        .insert()
        .into(PbftEntity)
        .values(_pbft)
        .orUpdate(['hash'], 'UQ_35a84f8058f83feff8f2941de6a')
        .setParameter('hash', _pbft?.hash || pbft.hash)
        .returning('*')
        .execute();

      if (saved) {
        this.logger.log(`Registered new PBFT ${_pbft.hash}`);

        if (pbft.transactions?.length > 0) {
          const newTransactions: ITransaction[] = pbft.transactions.map(
            (transaction) => {
              return {
                ...transaction,
                block: {
                  id: saved.raw[0]?.id,
                  hash: saved.raw[0]?.hash,
                  number: saved.raw[0]?.number,
                  timestamp: saved.raw[0]?.timestamp,
                },
              };
            }
          );

          _pbft.transactions =
            await this.txService.findTransactionsByHashesOrFill(
              newTransactions
            );
          _pbft.transactionCount = _pbft.transactions?.length;
          _pbft.save();
        }
      }
      const pbftFound = await this.pbftRepository.findOneBy({
        hash: _pbft.hash,
      });
      return pbftFound;
    } catch (error) {
      console.error(error);
    }
  }

  public async clearPbftData() {
    await this.pbftRepository.query('DELETE FROM "pbfts"');
  }

  public async getPbftsOfLastLevel(limit: number) {
    return await this.pbftRepository
      .createQueryBuilder('pbfts')
      .leftJoinAndSelect('pbfts.transactions', 'transactions')
      .select()
      .orderBy('pbfts.number', 'DESC')
      .limit(limit)
      .getMany();
  }

  public async getBlockByNumber(number: number) {
    return await this.pbftRepository.findOneBy({ number });
  }

  public async getBlockByHash(hash: string) {
    return await this.pbftRepository.findOneBy({ hash });
  }

  public getLastPbftHash = async () => {
    return (
      await this.pbftRepository
        .createQueryBuilder('pbfts')
        .leftJoinAndSelect('pbfts.transactions', 'transactions')
        .select()
        .orderBy('pbfts.timestamp', 'DESC')
        .limit(1)
        .getOne()
    ).hash;
  };

  public pbftRpcToIPBFT(pbftRpc: RPCPbft) {
    const {
      hash,
      number,
      timestamp,
      gasLimit,
      gasUsed,
      parentHash,
      nonce,
      difficulty,
      totalDifficulty,
      miner,
      transactionsRoot,
      extraData,
      transactions,
      logsBloom,
      mixHash,
      recepitsRoot,
      sha3Uncles,
      size,
      stateRoot,
    } = { ...pbftRpc };
    if (!hash) return;
    const pbft: IPBFT = {
      hash: zeroX(hash),
      number: parseInt(number, 16) || 0,
      timestamp: parseInt(timestamp, 16) || 0,
      gasLimit: parseInt(gasLimit, 16) || 0,
      gasUsed: parseInt(gasUsed, 16) || 0,
      parent: zeroX(parentHash),
      nonce,
      difficulty: parseInt(difficulty, 16) || 0,
      totalDifficulty: parseInt(totalDifficulty, 16) || 0,
      miner: toChecksumAddress(zeroX(miner)),
      transactionsRoot,
      transactionCount: transactions?.length || 0,
      transactions: transactions?.map((tx) => ({ hash: tx } as ITransaction)),
      extraData,
      logsBloom,
      mixHash,
      recepitsRoot,
      sha3Uncles,
      size: parseInt(size, 16) || 0,
      stateRoot,
    };
    return pbft;
  }

  public pbftGQLToIPBFT(pbftGQL: IGQLPBFT) {
    const {
      hash,
      number,
      timestamp,
      gasLimit,
      gasUsed,
      nonce,
      difficulty,
      totalDifficulty,
      miner,
      transactionsRoot,
      extraData,
      transactions,
      logsBloom,
      mixHash,
      recepitsRoot,
      ommerHash,
      stateRoot,
      parent,
    } = { ...pbftGQL };
    if (!hash) return;
    const pbft: IPBFT = {
      hash: zeroX(hash),
      number: number || 0,
      timestamp: timestamp || 0,
      gasLimit: gasLimit || 0,
      gasUsed: gasUsed || 0,
      parent: zeroX(parent?.hash),
      nonce,
      difficulty: difficulty || 0,
      totalDifficulty: totalDifficulty || 0,
      miner: zeroX(miner?.address),
      transactionsRoot: zeroX(transactionsRoot),
      transactionCount: transactions?.length || 0,
      transactions:
        transactions?.map((tx) => this.txService.gQLToITransaction(tx)) || [],
      extraData: zeroX(extraData),
      logsBloom: zeroX(logsBloom),
      mixHash: zeroX(mixHash),
      recepitsRoot: zeroX(recepitsRoot),
      sha3Uncles: zeroX(ommerHash),
      size: 0,
      stateRoot: zeroX(stateRoot),
    };
    return pbft;
  }

  public async handleNewPbft(pbftData: NewPbftBlockResponse) {
    if (!pbftData || !pbftData?.pbft_block?.block_hash) return;

    const pbft = await this.updateValuesForPbft(pbftData);
    const saved = await this.pbftRepository.save(pbft as PbftEntity);
    if (saved) {
      this.logger.log(`Registered new PBFT ${pbft.hash}`);
      console.log(`Registered new PBFT ${pbft.hash}`);
    }
  }

  public async handleNewPbftHeads(pbftData: NewPbftBlockHeaderResponse) {
    const {
      hash,
      number,
      timestamp,
      gas_limit,
      gasLimit,
      gas_used,
      gasUsed,
      parent,
      parentHash,
      parent_hash,
      nonce,
      difficulty,
      totalDifficulty,
      extraData,
      extra_data,
      log_bloom,
      logsBloom,
      miner,
      transactionCount,
      transactions,
      author,
      mixHash,
      receiptsRoot,
      receipts_root,
      sha3Uncles,
      size,
      stateRoot,
      state_root,
      transactionsRoot,
      transactions_root,
    } = { ...pbftData };
    if (!hash) return;

    const pbft: IPBFT = {
      hash: zeroX(hash),
      number: parseInt(number, 16) || 0,
      timestamp: parseInt(timestamp, 16) || 0,
      gasLimit: String(parseInt(gas_limit || gasLimit, 16)),
      gasUsed: String(parseInt(gas_used || gasUsed, 16)),
      parent: zeroX(parent || parentHash || parent_hash),
      nonce: String(parseInt(nonce, 16)),
      difficulty: parseInt(difficulty, 16) || 0,
      totalDifficulty: parseInt(totalDifficulty, 16) || 0,
      miner: toChecksumAddress(zeroX(miner || author)),
      extraData: zeroX(extraData || extra_data),
      transactionCount: parseInt(transactionCount, 16) || 0,
      logsBloom: zeroX(logsBloom || log_bloom),
      mixHash: zeroX(mixHash),
      recepitsRoot: zeroX(receiptsRoot || receipts_root),
      sha3Uncles: zeroX(sha3Uncles),
      size: parseInt(size, 16),
      stateRoot: zeroX(stateRoot || state_root),
      transactionsRoot: zeroX(transactionsRoot || transactions_root),
    };

    try {
      const updated = await this.pbftRepository.save(pbft as PbftEntity);
      if (updated && transactions && transactions.length > 0) {
        this.logger.log(`PBFT ${updated.hash} finalized`);
        const txes: ITransaction[] = transactions?.map((hash: string) => ({
          hash,
          block: {
            id: updated.id,
            hash: updated.hash,
            number: updated.number,
            timestamp: updated.timestamp,
          },
        }));
        const savedTx = await this.txService.findTransactionsByHashesOrFill(
          txes
        );
        pbft.transactions = savedTx;
      }
      this.logger.log(`Handled PBFT Heads for PBFT ${hash}`);
      console.log(`Handled PBFT Heads for PBFT ${hash}`);
      return updated;
    } catch (error) {
      this.logger.error('handleNewPbftHeads', error);
      console.error('handleNewPbftHeads', error);
    }
  }
}
