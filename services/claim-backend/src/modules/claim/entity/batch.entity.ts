import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
} from 'typeorm';
import { RewardEntity } from './reward.entity';
import { BatchTypes } from '../type/batch-type';
import { PendingRewardEntity } from './pending-reward.entity';

@Entity('batch')
export class BatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: BatchTypes.COMMUNITY_ACTIVITY })
  type: BatchTypes;

  @Column()
  name: string;

  @OneToMany(() => RewardEntity, (reward: RewardEntity) => reward.batch, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  rewards: RewardEntity[];

  @OneToMany(
    () => PendingRewardEntity,
    (pendingReward: PendingRewardEntity) => pendingReward.batch,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  pendingRewards: PendingRewardEntity[];

  @Column({
    default: true,
  })
  isDraft: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
