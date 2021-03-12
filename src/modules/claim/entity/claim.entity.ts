import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { BatchEntity } from './batch.entity';
import { AccountEntity } from './account.entity';

@Entity('claim')
export class ClaimEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => BatchEntity,
    batch => batch.claims,
    { onDelete: 'CASCADE' },
  )
  batch: BatchEntity;

  @ManyToOne(
    type => AccountEntity,
    account => account.address,
  )
  account: AccountEntity;

  @Column()
  @Index()
  address: string;

  @Column({ name: 'number_of_tokens' })
  numberOfTokens: number;

  @Column({ default: true })
  isUnlocked: boolean;

  @Column({ name: 'unlock_date' })
  unlockDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
