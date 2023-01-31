import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketModule } from '@0xelod/nestjs-websocket';
import { DagModule } from '../dag';
import { PbftModule } from '../pbft';
import { TransactionModule } from '../transaction';
import HistoricalSyncService from './historical.syncer.service';
import general from '../../config/general';
import { ConnectorsModule } from '../connectors';
import { BullModule } from '@nestjs/bull';
import * as dotenv from 'dotenv';
import { Queues } from '../../types';

dotenv.config();
const isProducer = process.env.ENABLE_PRODUCER_MODULE === 'true';
@Module({
  imports: [
    ConfigModule.forFeature(general),
    WebSocketModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          url: config.get<string>('general.wsConnectionURL'),
          followRedirects: false,
          handshakeTimeout: 10000,
        };
      },
    }),
    BullModule.registerQueue(
      {
        name: Queues.NEW_PBFTS,
      },
      {
        name: Queues.NEW_DAGS,
      }
    ),
    DagModule,
    PbftModule,
    TransactionModule,
    ConnectorsModule,
  ],
  providers: isProducer ? [HistoricalSyncService] : [],
  controllers: [],
  exports: isProducer ? [HistoricalSyncService] : [],
})
export class HistoricalSyncerModule {}
