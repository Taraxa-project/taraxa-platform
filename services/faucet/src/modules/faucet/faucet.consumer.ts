import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Job } from 'bull';
import { ethers } from 'ethers';
import { FaucetService } from './faucet.service';
import { TransactionRequest } from './types';

@Injectable()
@Processor('faucet')
export class FaucetConsumer implements OnModuleInit {
  private readonly logger = new Logger(FaucetConsumer.name);
  constructor(private readonly faucetService: FaucetService) {}

  onModuleInit(): void {
    this.logger.debug(`${FaucetConsumer.name} queue consumer started.`);
  }

  @Process('faucet')
  async transcode(job: Job<TransactionRequest>): Promise<void> {
    this.logger.debug(
      `Starting worker for job ${job.id}, data: ${JSON.stringify(
        job.data,
        null,
        2
      )}`
    );
    const { timestamp, ipv4, txRequest } = job.data;

    await this.faucetService.broadcastTransaction({
      timestamp,
      ipv4,
      txRequest,
    });
    this.logger.debug(
      `Processed request from ${timestamp} for address ${
        txRequest.to
      }: dripping ${ethers.utils.parseEther(
        txRequest.value?.toString()!
      )} TARA.`
    );
    job.moveToCompleted();
  }
}
