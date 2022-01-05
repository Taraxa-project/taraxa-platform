import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Node } from './node.entity';
import { NodeType } from './node-type.enum';
import { Repository } from 'typeorm';

@Injectable()
export class NodeTaskService {
  private readonly logger = new Logger(NodeTaskService.name);
  constructor(
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  @Cron('*/15 * * * *')
  async getStats() {
    this.logger.debug('Starting stats worker...');
    const mainnetExplorerUrl = this.configService.get<string>(
      'ethereum.mainnetExplorerUrl',
    );
    const testnetExplorerUrl = this.configService.get<string>(
      'ethereum.testnetExplorerUrl',
    );

    const nodes = await this.nodeRepository.find();
    for (const node of nodes) {
      let url: string;
      if (node.type === NodeType.MAINNET) {
        url = `${mainnetExplorerUrl}/api/address/${node.address}/stats`;
      } else {
        url = `${testnetExplorerUrl}/api/address/${node.address}/stats`;
      }
      const stats = await this.httpService
        .get(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .toPromise();
      if (stats.status !== 200) {
        this.logger.error(`Could not get stats for node ${node.address}`);
      }

      const { totalProduced, lastBlockTimestamp, rank, produced } = stats.data;

      node.blocksProduced = totalProduced;
      node.lastBlockCreatedAt = lastBlockTimestamp;
      node.weeklyRank = rank;
      node.weeklyBlocksProduced = produced;

      await this.nodeRepository.save(node);
    }
  }
}
