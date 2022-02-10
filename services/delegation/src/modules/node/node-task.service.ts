import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Node } from './node.entity';
import { NodeType } from './node-type.enum';
import { Repository } from 'typeorm';

@Injectable()
export class NodeTaskService implements OnModuleInit {
  private readonly logger = new Logger(NodeTaskService.name);
  constructor(
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}
  onModuleInit() {
    this.logger.debug(`Init ${NodeTaskService.name} cron`);
  }

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
      const uri = `/api/address/${node.address.toLowerCase()}/stats`;
      const url =
        node.type === NodeType.MAINNET
          ? `${mainnetExplorerUrl}${uri}`
          : `${testnetExplorerUrl}${uri}`;
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

      const {
        totalProduced,
        firstBlockTimestamp,
        lastBlockTimestamp,
        rank,
        produced,
      } = stats.data;

      const n = await this.nodeRepository.findOneOrFail(node.id);
      n.blocksProduced = totalProduced;
      n.firstBlockCreatedAt = firstBlockTimestamp;
      n.lastBlockCreatedAt = lastBlockTimestamp;
      n.weeklyRank = rank;
      n.weeklyBlocksProduced = produced;

      await this.nodeRepository.save(n);
    }
  }
}
