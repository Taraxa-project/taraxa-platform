import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketModule } from '@0xelod/nestjs-websocket';
import LiveSyncerService from './live.syncer.service';
import general from 'src/config/general';
import { BullModule } from '@nestjs/bull';
import * as dotenv from 'dotenv';
import { ConnectorsModule } from '../connectors';
import { DagModule } from '../dag';
import { PbftModule } from '../pbft';
import { TransactionModule } from '../transaction';
import { Queues } from 'src/types';
import { HistoricalSyncerModule } from '../historical-sync';

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
          port: config.get<number>('general.port'),
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
    HistoricalSyncerModule,
  ],
  providers: isProducer ? [LiveSyncerService] : [],
  controllers: [],
  exports: isProducer ? [LiveSyncerService] : [],
})
export class LiveSyncerModule {}
