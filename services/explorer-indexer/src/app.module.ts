import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { resolve } from 'path';
import { existsSync } from 'fs';
import {
  NodeModule,
  DagModule,
  PbftModule,
  TransactionModule,
  HealthModule,
  ConnectorsModule,
} from './modules';
import {
  NodeEntity,
  PbftEntity,
  DagEntity,
  TransactionEntity,
} from '@taraxa_project/explorer-shared';
import { BullModule } from '@nestjs/bull';

const getEnvFilePath = () => {
  const pathsToTest = ['../.env', '../../.env', '../../../.env'];

  for (const pathToTest of pathsToTest) {
    const resolvedPath = resolve(__dirname, pathToTest);

    if (existsSync(resolvedPath)) {
      return resolvedPath;
    }
  }
};

export const entities = [NodeEntity, TransactionEntity, PbftEntity, DagEntity];

const IndexerTypeOrmModule = () => {
  let typeOrmOptions: TypeOrmModuleOptions;
  const baseConnectionOptions: TypeOrmModuleOptions = process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities,
        synchronize: false,
        autoLoadEntities: true,
        logging: ['info'],
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'explorer_indexer',
        entities,
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
      envFilePath: getEnvFilePath(),
      isGlobal: true,
    }),
    IndexerTypeOrmModule(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          redis: {
            host: config.get<string>('general.redisHost'),
            port: config.get<number>('general.redisPort'),
          },
        };
      },
    }),
    NodeModule,
    DagModule,
    PbftModule,
    TransactionModule,
    HealthModule,
    ConnectorsModule,
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
