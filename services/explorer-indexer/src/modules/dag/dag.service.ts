import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IDAG } from '@taraxa_project/taraxa-models';
import { NewDagBlockResponse, NewDagBlockFinalizedResponse } from 'src/types';
import { zeroX } from 'src/utils';
import { Repository } from 'typeorm';
import { DagEntity } from './dag.entity';

@Injectable()
export default class DagService {
  private readonly logger: Logger = new Logger(DagService.name);
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
      hash: zeroX(hash),
      pivot: zeroX(pivot),
      tips,
      level,
      pbftPeriod: period,
      timestamp: parseInt(timestamp, 16) || 0,
      author: zeroX(author),
      signature: zeroX(signature),
      vdf,
      transactionCount,
      transactions,
    };
    const saved = await this.dagRepository.save(cherryPick);
    if (saved) this.logger.log(`Registered new DAG ${saved.hash}`);

    return saved;
  }

  public async updateDag(updateData: NewDagBlockFinalizedResponse) {
    let dag;

    dag = await this.dagRepository.findOneBy({ hash: updateData.block });
    if (!dag) dag = new DagEntity();
    dag.hash = zeroX(updateData.block);
    dag.pbftPeriod = parseInt(updateData.period, 10);
    const updated = await this.dagRepository.save(dag);
    if (updated) this.logger.log(`DAG ${updateData.block} finalized`);
  }
}
