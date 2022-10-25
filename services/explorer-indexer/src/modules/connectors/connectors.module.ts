import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { Module } from '@nestjs/common';
import { GraphQLConnectorService } from './graphql.connector.service';
import { RPCConnectorService } from './rpc.connector.service';
import general from 'src/config/general';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forFeature(general),
    HttpModule,
    GraphQLRequestModule.forRootAsync(GraphQLRequestModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          endpoint: config.get<string>('general.graphQLConnectionURL'),
        };
      },
    }),
  ],
  providers: [GraphQLConnectorService, RPCConnectorService],
  controllers: [],
  exports: [GraphQLConnectorService, RPCConnectorService],
})
export class ConnectorsModule {}
