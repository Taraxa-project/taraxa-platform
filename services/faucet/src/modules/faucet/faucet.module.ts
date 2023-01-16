import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlockchainModule } from '@faucet/blockchain';
import { ethereum, general, queue } from '@faucet/config';

import { RequestEntity } from './entity';
import { FaucetConsumer } from './faucet.consumer';
import { FaucetController } from './faucet.controller';
import { FaucetService } from './faucet.service';

@Module({
  imports: [
    ConfigModule.forFeature(queue),
    ConfigModule.forFeature(general),
    ConfigModule.forFeature(ethereum),
    TypeOrmModule.forFeature([RequestEntity]),
    BullModule.registerQueue({
      name: 'faucet',
    }),
    BlockchainModule,
  ],
  controllers: [FaucetController],
  providers: [FaucetService, FaucetConsumer],
  exports: [FaucetService],
})
export class FaucetModule {}
