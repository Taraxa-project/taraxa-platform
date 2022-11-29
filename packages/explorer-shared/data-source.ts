import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const getDataSourceOptions = (): DataSourceOptions => {
  return process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USE || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'hypepool',
      };
};

const DataSourceConfig = new DataSource({
  ...getDataSourceOptions(),
  entityPrefix: process.env.APP_PREFIX ? `${process.env.APP_PREFIX}_` : '',
  synchronize: false,
  migrationsRun: true,
  logging: process.env.NODE_ENV !== 'production',
  entities: [`${__dirname}/src/entities/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/src/migrations/*{.ts,.js}`],
  migrationsTableName: process.env.APP_PREFIX
    ? `${process.env.APP_PREFIX}_typeorm_migrations`
    : 'typeorm_migrations',
  metadataTableName: process.env.APP_PREFIX
    ? `${process.env.APP_PREFIX}_typeorm_metadata`
    : 'typeorm_metadata',
} as DataSourceOptions);

export default DataSourceConfig;
