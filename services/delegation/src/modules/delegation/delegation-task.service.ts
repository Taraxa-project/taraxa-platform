import { LessThan, Repository } from 'typeorm';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DelegationService } from './delegation.service';
import {
  BLOCKCHAIN_TESTNET_INSTANCE_TOKEN,
  BLOCKCHAIN_MAINNET_INSTANCE_TOKEN,
} from '../blockchain/blockchain.constant';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Undelegation } from './undelegation.entity';
import { NodeType } from '../node/node-type.enum';

@Injectable()
export class DelegationTaskService implements OnModuleInit {
  private readonly logger = new Logger(DelegationTaskService.name);

  constructor(
    @InjectRepository(Undelegation)
    private undelegationRepository: Repository<Undelegation>,
    private delegationService: DelegationService,
    @Inject(BLOCKCHAIN_TESTNET_INSTANCE_TOKEN)
    private testnetBlockchainService: BlockchainService,
    @Inject(BLOCKCHAIN_MAINNET_INSTANCE_TOKEN)
    private mainnetBlockchainService: BlockchainService,
  ) {}
  onModuleInit() {
    this.logger.debug(`Init ${DelegationTaskService.name} cron`);
  }

  @Cron('0 0 * * *')
  async rebalanceStaking() {
    this.logger.debug('Starting rebalance staking worker...');

    const delegators = await this.delegationService.getDelegators();
    for (const delegator of delegators) {
      const { address } = delegator;
      const balances = await this.delegationService.getBalances(address);

      if (balances.delegated > balances.total) {
        const diff = balances.delegated - balances.total;
        await this.delegationService.undelegate(address, diff);
      }
    }
  }

  @Cron('0 * * * *')
  async triggerUndelegations() {
    this.logger.debug('Starting undelegation trigger worker...');
    const un = await this.delegationService.getUntriggeredUndelegations();
    for (const u of un) {
      try {
        await this.delegationService.undelegateFromChain(u);
        this.logger.log(
          `Sent undelegation transaction for validator ${u.address}`,
        );
      } catch (e) {
        console.error(e);
        this.logger.error(
          `Could not send undelegation transaction for validator ${u.address}`,
        );
      }
    }
  }

  @Cron('0 * * * *')
  async confirmUndelegation() {
    this.logger.debug('Starting undelegation confirmation worker...');
    const currentBlock =
      await this.testnetBlockchainService.getCurrentBlockNumber();
    const undelegations =
      await this.delegationService.getUnconfirmedUndelegations(currentBlock);
    for (const undelegation of undelegations) {
      try {
        await this.delegationService.confirmUndelegation(undelegation);
        this.logger.log(
          `Confirmed undelegation for validator ${undelegation.address}`,
        );
      } catch (e) {
        console.error(e);
        this.logger.error(
          `Could not confirm undelegation for validator ${undelegation.address}`,
        );
      }
    }
  }
}
