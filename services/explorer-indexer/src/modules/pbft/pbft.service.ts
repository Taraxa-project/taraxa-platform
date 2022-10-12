import { Injectable, Ip, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPBFT, ITransaction } from '@taraxa_project/taraxa-models';
import { NewPbftBlockHeaderResponse, NewPbftBlockResponse } from 'src/types';
import { zeroX } from 'src/utils';
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
    const { block_hash, period, timestamp, beneficiary } = { ...pbftData };
    const existing = await this.pbftRepository.findOneBy({
      hash: zeroX(block_hash),
    });
    if (existing) {
      existing.number = period;
      existing.timestamp = timestamp;
      existing.miner = beneficiary;
      return existing;
    } else {
      const pbft: IPBFT = {
        hash: zeroX(block_hash),
        number: period || 0,
        timestamp: timestamp || 0,
        miner: zeroX(beneficiary),
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
      const existing = await this.pbftRepository.findOneBy({ hash: pbft.hash });
      if (!existing) {
        const newPbft = this.pbftRepository.create({
          hash: pbft.hash,
          miner: pbft.miner,
          number: pbft.number,
          timestamp: pbft.timestamp,
          nonce: pbft.nonce,
          reward: pbft.reward,
          gasLimit: String(pbft.gasLimit || '0'),
          gasUsed: String(pbft.gasUsed || '0'),
          parent: pbft.parent,
          difficulty: pbft.difficulty,
          totalDifficulty: pbft.totalDifficulty,
          transactionCount: pbft.transactionCount,
        });
        _pbft = newPbft;
      }
      if (!pbft.transactions) {
        _pbft.transactions = [];
      }
      _pbft.transactions = await this.txService.findTransactionsByHashesOrFill(
        pbft.transactions.map((tx) => tx.hash)
      );
      _pbft.transactionCount = _pbft.transactions?.length;

      const saved = await this.pbftRepository
        .createQueryBuilder()
        .insert()
        .into(PbftEntity)
        .values(_pbft)
        .orUpdate(['hash'], 'UQ_35a84f8058f83feff8f2941de6a')
        .setParameter('hash', _pbft.hash)
        .execute();

      if (saved) {
        this.logger.log(`Registered new PBFT ${_pbft.hash}`);
      }
      const pbftFound = await this.pbftRepository.findOneBy({
        hash: _pbft.hash,
      });
      console.log(pbftFound);
      return saved.raw[0];
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

  public pbftRpcToIPBFT(pbftRpc: NewPbftBlockHeaderResponse) {
    const {
      hash,
      number,
      timestamp,
      gas_limit,
      gas_used,
      parent,
      nonce,
      difficulty,
      totalDifficulty,
      miner,
      transactionCount,
      transactions,
    } = { ...pbftRpc };
    if (!hash) return;
    const pbft: IPBFT = {
      hash: zeroX(hash),
      number: parseInt(number, 16) || 0,
      timestamp: parseInt(timestamp, 16) || 0,
      gasLimit: gas_limit,
      gasUsed: gas_used,
      parent: zeroX(parent),
      nonce,
      difficulty: parseInt(difficulty, 16) || 0,
      totalDifficulty: parseInt(totalDifficulty, 16) || 0,
      miner: zeroX(miner),
      transactionCount: parseInt(transactionCount, 16) || 0,
      transactions: transactions?.map((tx) => ({ hash: tx } as ITransaction)),
    };
    return pbft;
  }

  public async handleNewPbft(pbftData: NewPbftBlockResponse) {
    if (!pbftData || !pbftData.block_hash) return;

    const pbft = await this.updateValuesForPbft(pbftData);
    const saved = await this.pbftRepository.save(pbft as PbftEntity);
    if (saved) {
      this.logger.log(`Registered new PBFT ${pbft.hash}`);
    }
  }

  public async handleNewPbftHeads(pbftData: NewPbftBlockHeaderResponse) {
    const {
      hash,
      number,
      timestamp,
      gas_limit,
      gas_used,
      parent,
      nonce,
      difficulty,
      totalDifficulty,
      miner,
      transactionCount,
      transactions,
    } = { ...pbftData };
    if (!hash) return;
    const txes = await this.txService.findTransactionsByHashesOrFill(
      transactions
    );
    const pbft: IPBFT = {
      hash: zeroX(hash),
      number: parseInt(number, 16) || 0,
      timestamp: parseInt(timestamp, 16) || 0,
      gasLimit: gas_limit,
      gasUsed: gas_used,
      parent: zeroX(parent),
      nonce,
      difficulty: parseInt(difficulty, 16) || 0,
      totalDifficulty: parseInt(totalDifficulty, 16) || 0,
      miner: zeroX(miner),
      transactionCount: parseInt(transactionCount, 16) || 0,
    };

    if (!pbft.transactions) {
      pbft.transactions = [];
    }
    pbft.transactions = txes;

    if (transactions?.length > 0) {
      console.error(pbft);
    }

    try {
      const updated = await this.pbftRepository.save(pbft as PbftEntity);
      if (updated) this.logger.log(`PBFT ${updated.hash} finalized`);
      return updated;
    } catch (error) {
      console.error('handleNewPbftHeads', error);
    }
  }
}
