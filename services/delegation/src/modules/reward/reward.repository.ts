import { EntityRepository, Repository } from 'typeorm';
import { Reward } from './reward.entity';

export interface TotalReward {
  address: string;
  amount: number;
}

@EntityRepository(Reward)
export class RewardRepository extends Repository<Reward> {
  async groupByAddress(): Promise<TotalReward[]> {
    return this.createQueryBuilder()
      .select(['SUM(value) as amount', 'LOWER(user_address) as address'])
      .groupBy('address')
      .where('user_address IS NOT NULL')
      .orderBy('amount', 'DESC')
      .getRawMany();
  }
}
