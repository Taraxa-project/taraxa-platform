import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketModule } from 'nestjs-websocket';
import { DagModule } from '../dag';
import { PbftModule } from '../pbft';
import { TransactionModule } from '../transaction';
import HistoricalSyncService from './historical.syncer.service';
import general from 'src/config/general';
import { ConnectorsModule } from '../connectors';

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
          followRedirects: false,
          handshakeTimeout: 10000,
        };
      },
    }),
    DagModule,
    PbftModule,
    TransactionModule,
    ConnectorsModule,
  ],
  providers: [HistoricalSyncService],
  controllers: [],
  exports: [HistoricalSyncService],
})
export class HistoricalSyncerModule {}
