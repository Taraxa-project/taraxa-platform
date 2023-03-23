import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Node } from './node.entity';
import { NodeType } from './node-type.enum';
import { Repository } from 'typeorm';
import { get } from '../utils/utils';
import { AddressDetailsResponse, NodeStatsReponse } from '../utils/interfaces';

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
    const mainnetIndexerUrl = this.configService.get<string>(
      'ethereum.mainnetIndexerUrl',
    );
    const testnetIndexerUrl = this.configService.get<string>(
      'ethereum.testnetIndexerUrl',
    );

    const nodes = await this.nodeRepository.find();
    let count = 0;
    for (const node of nodes) {
      count++;
      this.logger.debug(
        `- ${count} / ${
          nodes.length
        }: getting stats for node ${node.address.toLowerCase()}`,
      );
      const statsUri = `/address/${node.address.toLowerCase()}/stats`;
      const detailsUri = `/validators/${node.address.toLowerCase()}`;
      const statsUrl =
        node.type === NodeType.MAINNET
          ? `${mainnetIndexerUrl}${statsUri}`
          : `${testnetIndexerUrl}${statsUri}`;

      const detailsUrl =
        node.type === NodeType.MAINNET
          ? `${mainnetIndexerUrl}${detailsUri}`
          : `${testnetIndexerUrl}${detailsUri}`;

      try {
        const nodeStats = await get<NodeStatsReponse>(
          this.httpService,
          statsUrl,
          `Could not get stats for node ${node.address}.`,
        );

        const nodeDetails = await get<AddressDetailsResponse>(
          this.httpService,
          detailsUrl,
          `Could not get details for node ${node.address}.`,
        );

        const { lastPbftTimestamp, pbftCount: totalPbftsProduced } = nodeStats;

        const { pbftCount: weeklyPbftsProduced, rank } = nodeDetails;

        const n = await this.nodeRepository.findOneOrFail(node.id);
        if (!n.firstBlockCreatedAt) {
          n.firstBlockCreatedAt = new Date(lastPbftTimestamp * 1000);
        }
        n.lastBlockCreatedAt = new Date(lastPbftTimestamp * 1000);
        n.blocksProduced = totalPbftsProduced;
        n.weeklyRank = rank;
        n.weeklyBlocksProduced = weeklyPbftsProduced;

        await this.nodeRepository.save(n);
      } catch (e) {
        this.logger.error(`Could not get stats for node ${node.address}`);
      }
    }
  }
}
