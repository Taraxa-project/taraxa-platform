import { EntityRepository, Raw, Repository } from 'typeorm';
import { RewardQueryDto } from './dto/reward-query.dto';
import { Reward } from './reward.entity';

export interface TotalReward {
  address: string;
  amount: number;
}

@EntityRepository(Reward)
export class RewardRepository extends Repository<Reward> {
  async groupByAddress(query: RewardQueryDto): Promise<TotalReward[]> {
    const { type, epoch, user, address } = query;

    let rewardsQuery = this.createQueryBuilder()
      .select(['SUM(value) as amount', 'LOWER(user_address) as address'])
      .groupBy('address')
      .where('user_address IS NOT NULL')
      .orderBy('amount', 'DESC');

    if (type) {
      rewardsQuery = rewardsQuery.andWhere('type = :type', { type });
    }
    if (epoch) {
      rewardsQuery = rewardsQuery.andWhere('epoch = :epoch', { epoch });
    }
    if (user) {
      rewardsQuery = rewardsQuery.andWhere('user = :user', { user });
    }

    if (address) {
      rewardsQuery = rewardsQuery.andWhere({
        userAddress: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:address)`, {
          address,
        }),
      });
    }

    return rewardsQuery.getRawMany();
  }
}
