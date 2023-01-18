import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { DelegatorEntity, RewardsEntity, ValidatorEntity } from './entities';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_DATABASE || 'data/economics.sql',
  prepareDatabase: (db: any) => {
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = OFF');
  },
  synchronize: true,
  logging: false,
  entities: [ValidatorEntity, DelegatorEntity, RewardsEntity],
  migrations: [],
  subscribers: [],
});
