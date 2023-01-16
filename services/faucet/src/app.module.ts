import { RedisOptions } from 'ioredis';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { general, queue } from '@faucet/config';
import { FaucetModule } from './modules/faucet/faucet.module';
import { ThrottlerBehindProxyGuard } from './modules/throttler/throttler-behind-proxy.guard';

import dataSourceOptions from './data-source.options';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      load: [general],
    }),
    ThrottlerModule.forRootAsync({
      imports: [
        ConfigModule.forFeature(general),
        ConfigModule.forFeature(queue),
      ],
      useFactory: (
        generalConfig: ConfigType<typeof general>,
        queueConfig: ConfigType<typeof queue>
      ) => ({
        ttl: 60 * 60 * 24 * 7, // one week
        limit: generalConfig.maxRequestsForIpPerWeek,
        storage: new ThrottlerStorageRedisService({
          host: queueConfig.host,
          port: queueConfig.port,
          password: queueConfig.pass,
          keyPrefix: `throttler:${queueConfig.prefix}:`,
        } as RedisOptions),
      }),
      inject: [general.KEY, queue.KEY],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule.forFeature(queue)],
      useFactory: (config: ConfigService) => ({
        prefix: `bull:${config.get('queue.prefix')}`,
        redis: {
          host: config.get('queue.host'),
          port: config.get('queue.port'),
          password: config.get('queue.pass'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    FaucetModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
