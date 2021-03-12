import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { BatchEntity } from './batch.entity';
import { AccountEntity } from './account.entity';

@Entity('reward')
export class RewardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => BatchEntity,
    (batch: BatchEntity) => batch.rewards,
    { onDelete: 'CASCADE' },
  )
  batch: BatchEntity;

  @ManyToOne(
    type => AccountEntity,
    (account: AccountEntity) => account.address
  )
  account: AccountEntity;

  @Column()
  @Index()
  address: string;

  @Column({ name: 'number_of_tokens' })
  numberOfTokens: number;

  @Column({ default: false })
  isUnlocked: boolean;

  @Column({ name: 'unlock_date' })
  unlockDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
