import { EntityRepository, FindConditions, Raw, Repository } from 'typeorm';
import { Reward } from './reward.entity';

export interface TotalReward {
  address: string;
  amount: number;
}

@EntityRepository(Reward)
export class RewardRepository extends Repository<Reward> {
  async groupByAddress(): Promise<TotalReward[]> {
    return this.createQueryBuilder()
      .select(['SUM(value) as amount', 'user_address as address'])
      .groupBy('address')
      .where('user_address IS NOT NULL')
      .orderBy('amount', 'DESC')
      .getRawMany();
  }
  async filterByAddress(
    address: string,
    conditions: FindConditions<Reward>,
  ): Promise<Reward[]> {
    return this.find({
      userAddress: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
        address,
      }),
      ...conditions,
    });
  }
}
