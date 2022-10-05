import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPBFT } from '@taraxa_project/taraxa-models';
import { NewPbftBlockResponse } from 'src/types';
import { Repository } from 'typeorm';
import { PbftEntity } from './pbft.entity';

@Injectable()
export default class PbftService {
  constructor(
    @InjectRepository(PbftEntity)
    private pbftRepository: Repository<PbftEntity>
  ) {
    this.pbftRepository = pbftRepository;
  }

  public handleNewPbft(pbftData: NewPbftBlockResponse) {
    const {
      hash,
      number,
      timestamp,
      gasLimit,
      gasUsed,
      parent,
      nonce,
      difficulty,
      totalDifficulty,
      miner,
      transactionCount,
      transactions,
    } = { ...pbftData };
    const pbft: IPBFT = {
      hash,
      number: parseInt(number, 16),
      timestamp: parseInt(timestamp, 16),
      gasLimit: parseInt(gasLimit, 16),
      gasUsed: parseInt(gasUsed, 16),
      parent,
      nonce,
      difficulty: parseInt(difficulty, 16),
      totalDifficulty: parseInt(totalDifficulty, 16),
      miner,
      transactionCount: parseInt(transactionCount, 16) || 0,
      transactions,
    };
    return this.pbftRepository.save(pbft);
  }
}
