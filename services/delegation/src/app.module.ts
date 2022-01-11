import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

import generalConfig from './config/general';
import databaseConfig from './config/database';
import queueConfig from './config/queue';

import { AuthModule } from './modules/auth/auth.module';
import { NodeModule } from './modules/node/node.module';
import { ProfileModule } from './modules/profile/profile.module';
import { DelegationModule } from './modules/delegation/delegation.module';
import { HttpExceptionFilter } from './modules/utils/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      load: [generalConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get<number>('database.port'),
        username: config.get('database.user'),
        password: config.get('database.pass'),
        database: config.get('database.name'),
        autoLoadEntities: true,
        synchronize: !config.get<boolean>('isProd'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule.forFeature(queueConfig)],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('queue.host'),
          port: config.get('queue.port'),
          prefix: config.get('queue.prefix'),
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    NodeModule,
    ProfileModule,
    DelegationModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
