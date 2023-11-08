import { Repository } from 'typeorm';
import { RewardQueryDto } from './dto/reward-query.dto';
import { Reward } from './reward.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export interface TotalReward {
  address: string;
  amount: number;
}

@Injectable()
export class RewardRepository {
  constructor(
    @InjectRepository(Reward)
    private readonly usersRepository: Repository<Reward>,
  ) {}
  async groupByAddress(query: RewardQueryDto): Promise<TotalReward[]> {
    const { type, epoch, user, address } = query;

    let rewardsQuery = this.usersRepository
      .createQueryBuilder()
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
      rewardsQuery = rewardsQuery.andWhere(
        `LOWER(user_Address) LIKE LOWER(:address)`,
        {
          address: `%${address}%`,
        },
      );
    }

    return rewardsQuery.getRawMany();
  }
}
