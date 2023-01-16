import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { NodeModule, PbftModule, HealthModule, AddressModule } from './modules';
import {
  NodeEntity,
  PbftEntity,
  DagEntity,
  TransactionEntity,
} from '@taraxa_project/explorer-shared';
import generalConfig from './config/general';

export const entities = [NodeEntity, PbftEntity, DagEntity, TransactionEntity];

const getDataSourceConnectionOptions = (): TypeOrmModuleOptions => {
  let ssl: {
    rejectUnauthorized: boolean;
    ca?: string;
  } = {
    rejectUnauthorized: false,
  };

  if (process.env.DATABASE_CERT) {
    ssl = {
      ...ssl,
      ca: process.env.DATABASE_CERT,
    };
  }

  return process.env.DATABASE_URL
    ? {
        ssl,
        type: 'postgres',
        url: process.env.DATABASE_URL,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'explorer-indexer',
      };
};

const dataSourceOptions: TypeOrmModuleOptions = {
  ...getDataSourceConnectionOptions(),
  entityPrefix: process.env.APP_PREFIX ? `${process.env.APP_PREFIX}_` : '',
  synchronize: false,
  logging: ['info'],
  entities,
  migrationsTableName: process.env.APP_PREFIX
    ? `${process.env.APP_PREFIX}_typeorm_migrations`
    : 'typeorm_migrations',
  metadataTableName: process.env.APP_PREFIX
    ? `${process.env.APP_PREFIX}_typeorm_metadata`
    : 'typeorm_metadata',
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [generalConfig],
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    NodeModule,
    PbftModule,
    HealthModule,
    AddressModule,
  ],
})
export class AppModule {}
