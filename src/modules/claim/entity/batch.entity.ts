import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { RewardEntity } from './reward.entity';

@Entity('batch')
export class BatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ default: true })
  status: boolean;

  @OneToMany(
    type => RewardEntity,
    reward => reward.batch,
    { cascade: true, onDelete: 'CASCADE' },
  )
  rewards: RewardEntity[];
}
