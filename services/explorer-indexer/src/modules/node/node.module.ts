import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeEntity } from './node.entity';
import { WebSocketModule } from 'nestjs-websocket';
import NodeSyncerService from './nodeSyncer.service';
import { DagModule } from '../dag';
import { PbftModule } from '../pbft';
import { TransactionModule } from '../transaction';

@Injectable()
class ConfigService {
  public readonly connectionURL = process.env.NODE_WS_ENDPOINT;
  public readonly port = process.env.WS_SERVER_PORT;
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
class ConfigModule {}

@Module({
  imports: [
    TypeOrmModule.forFeature([NodeEntity]),
    WebSocketModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          url: config.connectionURL,
          port: config.port,
          followRedirects: false,
          handshakeTimeout: 10000,
        };
      },
    }),
    DagModule,
    PbftModule,
    TransactionModule,
  ],
  providers: [NodeSyncerService],
  controllers: [],
  exports: [NodeSyncerService],
})
export class NodeModule {}