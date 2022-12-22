import { Validator, Delegator } from './types';
import { AppDataSource } from './data-source';
import { ValidatorEntity, DelegatorEntity } from './entities';

export const initializeConnection = async () => {
  await AppDataSource.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((err): any => {
      console.error('Error during Data Source initialization', err);
    });
};

export const saveValidator = async (validator: Validator) => {
  const saved = await AppDataSource.manager
    .getRepository(ValidatorEntity)
    .createQueryBuilder()
    .insert()
    .into(ValidatorEntity)
    .values(validator)
    .orIgnore(true)
    .execute();

  if (saved.raw[0]) {
    console.log('Registered new reward entry');
  }
  return saved.raw[0];
};

export const saveDelegator = async (delegator: Delegator) => {
  const saved = await AppDataSource.manager
    .getRepository(DelegatorEntity)
    .createQueryBuilder()
    .insert()
    .into(DelegatorEntity)
    .values(delegator)
    .orIgnore(true)
    .execute();

  if (saved.raw[0]) {
    console.log('Registered new delegator entry');
  }
  return saved.raw[0];
};

export const fetchLatestBlockNumber = async (): Promise<number | undefined> => {
  const block = await AppDataSource.manager
    .getRepository(ValidatorEntity)
    .createQueryBuilder('b')
    .select('MAX(b.blockNumber)', 'blockNumber')
    .getRawOne();
  return block?.blockNumber;
};

export const deleteLatestValidatorsWhereBlock = async (blockNumber: number) => {
  await AppDataSource.manager
    .getRepository(ValidatorEntity)
    .createQueryBuilder()
    .delete()
    .from(ValidatorEntity)
    .where('blockNumber = :blockNumber', { blockNumber })
    .execute();
};
