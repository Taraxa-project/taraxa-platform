import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { BatchEntity } from './batch.entity';

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

  @Column()
  @Index()
  address: string;

  @Column({ name: 'number_of_tokens' })
  numberOfTokens: number;

  @Column({ name: 'unlock_date' })
  unlockDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ default: true })
  status: boolean;
}
