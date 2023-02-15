import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { PbftModule } from '../pbft';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [
    TerminusModule,
    PbftModule,
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
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
