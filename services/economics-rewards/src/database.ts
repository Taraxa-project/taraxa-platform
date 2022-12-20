import { Reward } from './types';
import { RewardsEntity } from './entities/rewards.entity';
import { AppDataSource } from './data-source';

export const initializeConnection = () => {
  AppDataSource.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((err): any => {
      console.error('Error during Data Source initialization', err);
    });
};

export const saveReward = async (reward: Reward) => {
  const saved = await AppDataSource.manager
    .getRepository(RewardsEntity)
    .createQueryBuilder()
    .insert()
    .into(RewardsEntity)
    .values(reward)
    .execute();

  if (saved.raw[0]) {
    console.log('Registered new reward entry');
  }
  return saved.raw[0];
};
