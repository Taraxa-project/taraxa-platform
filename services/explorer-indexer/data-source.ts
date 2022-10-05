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
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'hypepool',
      };
};

const DataSourceConfig = new DataSource({
  ...getDataSourceOptions(),
  synchronize: false,
  migrationsRun: true,
  logging: process.env.NODE_ENV !== 'production',
  entities: [`${__dirname}/src/modules/**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/src/migrations/*{.ts,.js}`],
  migrationsTableName: 'migrations_explorer_indexer',
} as DataSourceOptions);

export default DataSourceConfig;
