import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import {
  DagModule,
  PbftModule,
  TransactionModule,
  HealthModule,
  ConnectorsModule,
  LiveSyncerModule,
  HistoricalSyncerModule,
} from './modules';
import general from './config/general';
import dataSourceOptions from './data-source.options';
import { APP_FILTER } from '@nestjs/core';
import { JobProcessingExceptionFilter } from './modules/JobExceptionFilter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [general],
      ignoreEnvFile: false,
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        prefix: `bull:${config.get('general.queuePrefix')}`,
        redis: {
          host: config.get<string>('general.redisHost'),
          port: config.get<number>('general.redisPort'),
          password: config.get<string>('general.redisPassword'),
        },
        removeOnComplete: true,
        removeOnCompleteTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        settings: {
          lockDuration: config.get<number>('general.maxLockDuration'),
        },
      }),
    }),
    LiveSyncerModule,
    HistoricalSyncerModule,
    DagModule,
    PbftModule,
    TransactionModule,
    HealthModule,
    ConnectorsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: JobProcessingExceptionFilter,
    },
  ],
  exports: [],
})
export class AppModule {}
