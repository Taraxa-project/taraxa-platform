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

  @ManyToOne(() => BatchEntity, (batch: BatchEntity) => batch.rewards, {
    onDelete: 'CASCADE',
  })
  batch: BatchEntity;

  @ManyToOne(() => AccountEntity, (account: AccountEntity) => account.address)
  account: AccountEntity;

  @Column()
  @Index()
  address: string;

  @Column()
  numberOfTokens: string;

  @Column({ default: false })
  isUnlocked: boolean;

  @Column()
  unlockDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
