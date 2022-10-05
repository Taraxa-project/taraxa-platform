import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IDAG } from '@taraxa_project/taraxa-models';
import { NewDagBlockResponse, NewDagBlockFinalizedResponse } from 'src/types';
import { Repository } from 'typeorm';
import { DagEntity } from './dag.entity';

@Injectable()
export default class DagService {
  constructor(
    @InjectRepository(DagEntity)
    private dagRepository: Repository<DagEntity>
  ) {
    this.dagRepository = dagRepository;
  }

  public async handleNewDag(dagData: NewDagBlockResponse) {
    const {
      hash,
      pivot,
      tips,
      level,
      period,
      timestamp,
      author,
      signature,
      vdf,
      transactionCount,
      transactions,
    } = { ...dagData };
    const cherryPick: IDAG = {
      hash,
      pivot,
      tips,
      level,
      pbftPeriod: period,
      timestamp: parseInt(timestamp, 16),
      author,
      signature,
      vdf,
      transactionCount,
      transactions,
    };
    return await this.dagRepository.save(cherryPick);
  }

  public async updateDag(updateData: NewDagBlockFinalizedResponse) {
    const dag = await this.dagRepository.findOneBy({ hash: updateData.block });
    if (dag) {
      dag.pbftPeriod = parseInt(updateData.period, 10);
      return await this.dagRepository.save(dag);
    }
  }
}
