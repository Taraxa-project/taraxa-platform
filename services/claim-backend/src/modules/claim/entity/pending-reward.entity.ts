import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { BatchEntity } from './batch.entity';
import { AccountEntity } from './account.entity';

@Entity('pending_reward')
export class PendingRewardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BatchEntity, (batch: BatchEntity) => batch.pendingRewards, {
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
}
