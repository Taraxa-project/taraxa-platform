import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Node } from './node.entity';
import { NodeType } from './node-type.enum';
import { Repository } from 'typeorm';
import { catchError, firstValueFrom, map } from 'rxjs';

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
    let count = 0;
    for (const node of nodes) {
      count++;
      this.logger.debug(
        `- ${count} / ${
          nodes.length
        }: getting stats for node ${node.address.toLowerCase()}`,
      );
      const uri = `/address/${node.address.toLowerCase()}/stats`;
      const url =
        node.type === NodeType.MAINNET
          ? `${mainnetExplorerUrl}${uri}`
          : `${testnetExplorerUrl}${uri}`;

      try {
        const stats = await firstValueFrom(
          this.httpService
            .get(url, {
              headers: {
                'Content-Type': 'application/json',
              },
            })
            .pipe(
              map((res) => {
                return res.data?.result;
              }),
              catchError((err, caught) => {
                this.logger.error(
                  `Could not get stats for node ${node.address}. Error: ${err}`,
                );
                return caught;
              }),
            ),
        );

        const { pbftCount, lastPbftTimestamp } = stats;

        const n = await this.nodeRepository.findOneOrFail(node.id);
        n.blocksProduced = pbftCount;
        if (!n.firstBlockCreatedAt) {
          n.firstBlockCreatedAt = new Date(lastPbftTimestamp);
        }
        n.lastBlockCreatedAt = lastPbftTimestamp;

        await this.nodeRepository.save(n);
      } catch (e) {
        this.logger.error(`Could not get stats for node ${node.address}`);
      }
    }
  }
}
