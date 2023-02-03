import { DataSourceOptions } from 'typeorm';
import {
  NodeEntity,
  PbftEntity,
  DagEntity,
  TransactionEntity,
} from '@taraxa_project/explorer-shared';
import * as dotenv from 'dotenv';
dotenv.config();

export const entities = [NodeEntity, TransactionEntity, PbftEntity, DagEntity];

const getDataSourceConnectionOptions = (): DataSourceOptions => {
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

const dataSourceOptions: DataSourceOptions = {
  ...getDataSourceConnectionOptions(),
  synchronize: false,
  logging: ['info'],
  entities,
  migrationsTableName: 'typeorm_migrations',
  metadataTableName: 'typeorm_metadata',
};

export default dataSourceOptions;
