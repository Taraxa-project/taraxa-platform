import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPBFT } from '@taraxa_project/taraxa-models';
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

  public getLastPbftHash = async () => {
    return (
      await this.pbftRepository
        .createQueryBuilder('pbfts')
        .select()
        .orderBy('pbfts.timestamp', 'DESC')
        .limit(1)
        .getOne()
    ).hash;
  };

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
      console.error('handleNewPbftHeads');
      console.error(error);
    }
  }
}
