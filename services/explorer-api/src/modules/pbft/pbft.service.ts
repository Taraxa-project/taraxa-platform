import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Repository, Between } from 'typeorm';
import { PbftEntity } from '@taraxa_project/explorer-shared';

@Injectable()
export class PbftService {
  private logger = new Logger('PbftService');

  constructor(
    @InjectRepository(PbftEntity)
    private repository: Repository<PbftEntity>
  ) {}

  public async getTotalBlocksThisWeek(): Promise<number> {
    const monday = DateTime.now()
      .startOf('week')
      .toSeconds()
      ?.toString()
      .split('.')[0];
    const sunday = DateTime.now()
      .endOf('week')
      .toSeconds()
      ?.toString()
      .split('.')[0];
    const total = await this.repository.findBy({
      timestamp: Between(Number(monday), Number(sunday)),
    });
    return total.length;
  }
}
