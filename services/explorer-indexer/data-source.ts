import 'reflect-metadata';
import dataSourceOptions from './src/data-source.options';
import { DataSource } from 'typeorm';

const DataSourceInstance = new DataSource({
  ...dataSourceOptions,
  migrationsRun: true,
});

export default DataSourceInstance;
