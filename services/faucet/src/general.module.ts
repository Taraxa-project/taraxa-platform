import { database, ethereum, general, queue } from '@faucet/config';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { resolve } from 'path';
import { existsSync } from 'fs';

const getEnvFilePath = () => {
  const pathsToTest = ['../.env', '../../.env', '../../../.env'];

  for (const pathToTest of pathsToTest) {
    const resolvedPath = resolve(__dirname, pathToTest);

    if (existsSync(resolvedPath)) {
      return resolvedPath;
    }
  }
};

const buildTypeOrmModule = () => {
  let typeOrmOptions: TypeOrmModuleOptions;
  const baseConnectionOptions: TypeOrmModuleOptions = process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        synchronize: false,
        autoLoadEntities: true,
        logging: ['info'],
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'requests',
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        synchronize: false,
        autoLoadEntities: true,
        logging: ['info'],
      };

  if (!!process.env.DATABASE_CERT) {
    typeOrmOptions = {
      ...baseConnectionOptions,
      ssl: {
        rejectUnauthorized: false,
        ca: process.env.DATABASE_CERT,
      },
    };
  } else {
    typeOrmOptions = { ...baseConnectionOptions };
  }
  return TypeOrmModule.forRoot(typeOrmOptions);
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [general, database, ethereum],
      envFilePath: getEnvFilePath(),
    }),
    ThrottlerModule.forRoot({
      ttl: 60 * 60 * 24, // 7 requests for a day
      limit: 7,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule.forFeature(queue)],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('queue.host'),
          port: config.get('queue.port'),
          password: config.get('queue.pass'),
          prefix: config.get('queue.prefix'),
        },
      }),
      inject: [ConfigService],
    }),
    buildTypeOrmModule(),
    EventEmitterModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class GeneralModule {}
