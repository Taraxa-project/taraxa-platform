import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketModule } from 'nestjs-websocket';
import LiveSyncerService from './live.syncer.service';
import general from 'src/config/general';

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
  ],
  providers: [LiveSyncerService],
  controllers: [],
  exports: [LiveSyncerService],
})
export class LiveSyncerModule {}
