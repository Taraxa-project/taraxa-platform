import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NodeEntity } from './node.entity';
import { WebSocketModule } from 'nestjs-websocket';
import NodeSyncerService from './nodeSyncer.service';
import { DagModule } from '../dag';
import { PbftModule } from '../pbft';
import { TransactionModule } from '../transaction';
import { HttpModule } from '@nestjs/axios';
import HistoricalSyncService from './historicalSyncer.service';
import RPCConnectorService from './rpcConnector.service';
import general from 'src/config/general';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { GraphQLConnector } from './graphQLConnector.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forFeature(general),
    TypeOrmModule.forFeature([NodeEntity]),
    GraphQLRequestModule.forRootAsync(GraphQLRequestModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          endpoint: config.get<string>('general.graphQLConnectionURL'),
        };
      },
    }),
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
  ],
  providers: [
    NodeSyncerService,
    RPCConnectorService,
    HistoricalSyncService,
    GraphQLConnector,
  ],
  controllers: [],
  exports: [
    NodeSyncerService,
    RPCConnectorService,
    HistoricalSyncService,
    GraphQLConnector,
  ],
})
export class NodeModule {}
