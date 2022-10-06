import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPBFT } from '@taraxa_project/taraxa-models';
import { NewPbftBlockHeaderResponse, NewPbftBlockResponse } from 'src/types';
import { zeroX } from 'src/utils';
import { Repository } from 'typeorm';
import { PbftEntity } from './pbft.entity';

@Injectable()
export default class PbftService {
  private readonly logger: Logger = new Logger(PbftService.name);
  constructor(
    @InjectRepository(PbftEntity)
    private pbftRepository: Repository<PbftEntity>
  ) {
    this.pbftRepository = pbftRepository;
  }

  public async handleNewPbft(pbftData: NewPbftBlockResponse) {
    const { block_hash, period, timestamp, beneficiary } = { ...pbftData };
    if (!block_hash) return;
    const pbft: IPBFT = {
      hash: zeroX(block_hash),
      number: period || 0,
      timestamp: timestamp || 0,
      miner: zeroX(beneficiary),
    };
    const saved = await this.pbftRepository.save(pbft as PbftEntity);
    if (saved) this.logger.log(`Registered new PBFT ${saved.hash}`);
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
      transactions,
    };
    const updated = await this.pbftRepository.save(pbft as PbftEntity);
    if (updated) this.logger.log(`PBFT ${updated.hash} finalized`);
  }
}
