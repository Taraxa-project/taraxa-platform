import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPBFT } from '@taraxa_project/taraxa-models';
import { NewPbftBlockHeaderResponse, NewPbftBlockResponse } from 'src/types';
import { zeroX } from 'src/utils';
import { Repository } from 'typeorm';
import { TaraxaNode } from '../node';
import { PbftEntity } from './pbft.entity';

@Injectable()
export default class PbftService {
  private readonly logger: Logger = new Logger(PbftService.name);
  constructor(
    @InjectRepository(PbftEntity)
    private pbftRepository: Repository<PbftEntity>,
    @InjectRepository(TaraxaNode)
    private nodeRepository: Repository<TaraxaNode>
  ) {
    this.pbftRepository = pbftRepository;
  }

  private updateValuesForPbft = async (pbftData: NewPbftBlockResponse) => {
    const { block_hash, period, timestamp, beneficiary } = { ...pbftData };
    const existing = await this.pbftRepository.findOneBy({ hash: block_hash });
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
      await this.createOrUpdateNode(saved);
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

  private async createOrUpdateNode(pbft: PbftEntity) {
    const foundNode = await this.nodeRepository.findOne({
      where: { address: pbft.miner },
    });
    if (foundNode) {
      foundNode.lastBlockNumber = pbft.number;
      foundNode.pbftCount += 1;
      await this.nodeRepository.save(foundNode);
      this.logger.log(`Updated node ${foundNode.address}`);
    } else {
      const newNode = await this.nodeRepository.save({
        address: pbft.miner,
        lastBlockNumber: pbft.number,
        pbftCount: 1,
      });
      if (newNode) {
        this.logger.log(`Registered new Node ${newNode.address}`);
      }
    }
  }
}
