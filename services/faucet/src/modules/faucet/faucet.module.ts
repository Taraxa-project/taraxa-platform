import { BlockchainModule } from '@faucet/blockchain';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import ethereum from 'config/ethereum';
import general from 'config/general';
import queue from 'config/queue';
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
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    BlockchainModule,
  ],
  controllers: [FaucetController],
  providers: [FaucetService, FaucetConsumer],
  exports: [FaucetService],
})
export class FaucetModule {}
