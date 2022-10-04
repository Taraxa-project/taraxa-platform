import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IDAG } from '@taraxa_project/taraxa-models';
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

  public handleNewDag(dag: IDAG) {
    return this.dagRepository.save(dag);
  }
}
