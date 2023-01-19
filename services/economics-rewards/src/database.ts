import { Validator, Delegator } from './types';
import { AppDataSource } from './data-source';
import { ValidatorEntity, DelegatorEntity, RewardsEntity } from './entities';

export const initializeConnection = async (): Promise<void> => {
  await AppDataSource.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((err): any => {
      console.error('Error during Data Source initialization', err);
    });
};

export const saveValidator = async (
  validator: Validator
): Promise<ValidatorEntity> => {
  const saved = await AppDataSource.manager
    .getRepository(ValidatorEntity)
    .createQueryBuilder()
    .insert()
    .into(ValidatorEntity)
    .values(validator)
    .orIgnore(true)
    .execute();

  if (saved.raw) {
    console.log('Registered new reward entry');
  }
  return saved.raw;
};

export const saveDelegator = async (
  delegator: Delegator
): Promise<DelegatorEntity> => {
  const saved = await AppDataSource.manager
    .getRepository(DelegatorEntity)
    .createQueryBuilder()
    .insert()
    .into(DelegatorEntity)
    .values(delegator)
    .orIgnore(true)
    .execute();

  if (saved.raw) {
    console.log('Registered new delegator entry');
  }
  return saved.raw;
};

export const fetchLatestBlockNumber = async (): Promise<number | undefined> => {
  const block = await AppDataSource.manager
    .getRepository(ValidatorEntity)
    .createQueryBuilder('b')
    .select('MAX(b.blockNumber)', 'blockNumber')
    .getRawOne();
  return block?.blockNumber;
};

export const deleteLatestValidatorsWhereBlock = async (
  blockNumber: number
): Promise<void> => {
  await AppDataSource.manager
    .getRepository(ValidatorEntity)
    .createQueryBuilder()
    .delete()
    .from(ValidatorEntity)
    .where('blockNumber = :blockNumber', { blockNumber })
    .execute();
};

export const getValidators = async (): Promise<ValidatorEntity[]> => {
  return await AppDataSource.manager
    .getRepository(ValidatorEntity)
    .createQueryBuilder()
    .select()
    .getMany();
};

export const getDelegators = async (): Promise<DelegatorEntity[]> => {
  return await AppDataSource.manager
    .getRepository(DelegatorEntity)
    .createQueryBuilder()
    .select()
    .getMany();
};

export const getRewards = async (query: string): Promise<any> => {
  const leftTableName = 'validator';
  const rightTableName = 'delegator';
  const commonColumn1 = 'blockNumber';
  const commonLeftColumn2 = 'account';
  const commonRightColumn2 = 'validator';

  const results = await AppDataSource.manager.query(`
    SELECT ${leftTableName}.blockNumber, ${leftTableName}.blockTimestamp, ${leftTableName}.blockHash, ${leftTableName}.commission, ${leftTableName}.commissionReward, ${rightTableName}.validator, ${rightTableName}.delegator, ${rightTableName}.stake, ${rightTableName}.rewards
    FROM ${leftTableName}
    INNER JOIN ${rightTableName}
    ON ${leftTableName}.${commonColumn1} = ${rightTableName}.${commonColumn1} AND ${leftTableName}.${commonLeftColumn2} = ${rightTableName}.${commonRightColumn2}
    ${query} ORDER BY ${leftTableName}.blockNumber DESC
  `);

  return results;
};

export const saveRewardsRowCount = async (rowCount: number): Promise<void> => {
  const rewards = await AppDataSource.manager
    .getRepository(RewardsEntity)
    .createQueryBuilder()
    .select()
    .where('id = :id', { id: 1 })
    .getOne();

  if (!rewards) {
    // Insert the row
    await AppDataSource.manager
      .getRepository(RewardsEntity)
      .createQueryBuilder()
      .insert()
      .into(RewardsEntity)
      .values({ id: 1, rowCount: rowCount })
      .execute();
  } else {
    // Update the row
    await AppDataSource.manager
      .getRepository(RewardsEntity)
      .createQueryBuilder()
      .update(RewardsEntity)
      .set({ rowCount: rowCount })
      .where('id = :id', { id: 1 })
      .execute();
  }
  console.log('Saved last row count: ', rowCount);
  return;
};

export const getRewardsRowCount = async (): Promise<number> => {
  const results = await AppDataSource.manager.query(
    `SELECT "rowCount" FROM rewards`
  );
  console.log('Fetched last row count: ', results);

  return results[0]?.rowCount;
};

export const clearRewardsRowCount = async (): Promise<void> => {
  return await AppDataSource.manager.query(`DELETE FROM rewards`);
};
