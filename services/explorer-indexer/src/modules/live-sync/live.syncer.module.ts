import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketModule } from 'nestjs-websocket';
import LiveSyncerService from './live.syncer.service';
import general from 'src/config/general';
import { BullModule } from '@nestjs/bull';
import * as dotenv from 'dotenv';

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
          followRedirects: false,
          handshakeTimeout: 10000,
        };
      },
    }),
    BullModule.registerQueue({
      name: 'new_pbfts',
    }),
  ],
  providers: isProducer ? [LiveSyncerService] : [],
  controllers: [],
  exports: isProducer ? [LiveSyncerService] : [],
})
export class LiveSyncerModule {}
