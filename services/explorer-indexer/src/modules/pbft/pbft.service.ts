import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPBFT } from '@taraxa_project/taraxa-models';
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

  public handleNewPbft(pbft: IPBFT) {
    return this.pbftRepository.save(pbft);
  }
}
