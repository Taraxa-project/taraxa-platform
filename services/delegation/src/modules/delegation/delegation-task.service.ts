import { Repository, MoreThan } from 'typeorm';
import moment from 'moment';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Delegation } from './delegation.entity';
import { DelegationService } from './delegation.service';
import { NodeService } from '../node/node.service';
import { NodeType } from '../node/node-type.enum';

@Injectable()
export class DelegationTaskService {
  private readonly logger = new Logger(DelegationTaskService.name);

  constructor(
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
    private delegationService: DelegationService,
    private nodeService: NodeService,
  ) {}

  @Cron('*/15 * * * *')
  async delegateMainnet() {
    this.logger.debug('Starting mainnet delegation worker...');
    const date = moment().utc().subtract(15, 'minutes').utc().toDate();
    const delegations = await this.delegationRepository.find({
      where: {
        createdAt: MoreThan(date),
      },
      relations: ['node'],
    });

    const nodeDelegation: { [key: string]: number } = {};
    for (const delegation of delegations) {
      if (nodeDelegation[delegation.node.address]) {
        continue;
      }
      const allDelegations = await this.delegationRepository.find({
        node: delegation.node,
      });
      nodeDelegation[delegation.node.address] = allDelegations.reduce(
        (acc, delegation) => acc + delegation.value,
        0,
      );
    }

    for (const nodeAddress in nodeDelegation) {
      await this.delegationService.ensureMainnetDelegation(
        nodeAddress,
        nodeDelegation[nodeAddress],
      );
    }
  }

  @Cron('*/15 * * * *')
  async delegateTestnet() {
    this.logger.debug('Starting testnet delegation worker...');
    const date = moment().utc().subtract(15, 'minutes').utc().toDate();
    const nodes = await this.nodeService.findNodes({
      type: NodeType.TESTNET,
    });

    for (const node of nodes) {
      const createdAt = moment(node.createdAt).utc().toDate();
      if (createdAt < date) {
        continue;
      }

      await this.delegationService.ensureTestnetDelegation(node.address);
    }
  }
}
