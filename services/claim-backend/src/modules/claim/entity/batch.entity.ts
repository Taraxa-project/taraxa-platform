import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
} from 'typeorm';
import { RewardEntity } from './reward.entity';

export enum BatchTypes {
  PRIVATE_SALE = 'PRIVATE_SALE',
  PUBLIC_SALE = 'PUBLIC_SALE',
  COMMUNITY_ACTIVITY = 'COMMUNITY_ACTIVITY',
}

@Entity('batch')
export class BatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: BatchTypes.COMMUNITY_ACTIVITY })
  type: BatchTypes;

  @Column()
  name: string;

  @OneToMany((type) => RewardEntity, (reward: RewardEntity) => reward.batch, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  rewards: RewardEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
