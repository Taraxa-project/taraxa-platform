import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { DelegatorEntity, ValidatorEntity } from './entities';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DB_DATABASE || 'data/economics.sql',
  synchronize: true,
  logging: false,
  entities: [ValidatorEntity, DelegatorEntity],
  migrations: [],
  subscribers: [],
});
