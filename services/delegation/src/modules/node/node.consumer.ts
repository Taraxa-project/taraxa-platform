import { Job } from 'bull';
import { Repository } from 'typeorm';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Node } from './node.entity';
import { NodeService } from './node.service';
import { ENSURE_NODE_ONCHAIN_JOB } from './node.constants';
import { EnsureNodeOnchainJob } from './job/ensure-node-onchain.job';
import {
  BLOCKCHAIN_TESTNET_INSTANCE_TOKEN,
  BLOCKCHAIN_MAINNET_INSTANCE_TOKEN,
} from '../blockchain/blockchain.constant';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
@Processor('node')
export class NodeConsumer implements OnModuleInit {
  private readonly logger = new Logger(NodeConsumer.name);
  constructor(
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
    private nodeService: NodeService,
    @Inject(BLOCKCHAIN_TESTNET_INSTANCE_TOKEN)
    private testnetBlockchainService: BlockchainService,
    @Inject(BLOCKCHAIN_MAINNET_INSTANCE_TOKEN)
    private mainnetBlockchainService: BlockchainService,
  ) {}
  onModuleInit() {
    this.logger.debug(`Init ${NodeConsumer.name} worker`);
  }
  @Process(ENSURE_NODE_ONCHAIN_JOB)
  async ensureNodeOnchain(job: Job<EnsureNodeOnchainJob>) {
    this.logger.debug(
      `Starting ${ENSURE_NODE_ONCHAIN_JOB} worker for job ${
        job.id
      }, data: ${JSON.stringify(job.data, null, 2)}`,
    );

    const { nodeId } = job.data;

    this.logger.debug(
      `${ENSURE_NODE_ONCHAIN_JOB} worker (job ${job.id}): Ensuring node ${nodeId} is onchain`,
    );

    const node = await this.nodeService.findNodeByOrFail({
      id: nodeId,
    });

    if (node.isCreatedOnchain) {
      this.logger.debug(
        `${ENSURE_NODE_ONCHAIN_JOB} worker (job ${job.id}): Validator ${node.address} is created. Skipping create`,
      );
      return;
    }

    let isCreatedOnchain = false;
    if (node.isTestnet()) {
      try {
        await this.testnetBlockchainService.getValidator(node.address);
        isCreatedOnchain = true;
      } catch (e) {
        this.logger.debug(
          `${ENSURE_NODE_ONCHAIN_JOB} worker (job ${job.id}): Validator ${node.address} doesn't exist in contract`,
        );
      }
    }

    if (isCreatedOnchain) {
      node.isCreatedOnchain = isCreatedOnchain;
      await this.nodeRepository.save(node);

      this.logger.debug(
        `${ENSURE_NODE_ONCHAIN_JOB} worker (job ${job.id}): Validator ${node.address} exist. Skipping create`,
      );
      return;
    }

    try {
      if (node.isTestnet()) {
        node.isCreatedOnchain =
          await this.testnetBlockchainService.registerValidator(
            node.address,
            node.addressProof,
            node.vrfKey,
          );
      }

      await this.nodeRepository.save(node);
    } catch (e) {
      this.logger.error(
        `${ENSURE_NODE_ONCHAIN_JOB} worker (job ${job.id}): Failed to create onchain validator for ${node.address}.`,
      );
    }
  }
}
