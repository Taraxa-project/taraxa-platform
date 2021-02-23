import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { BatchEntity } from './batch.entity';

export enum ClaimStatus {
  Added,
  Approved,
}

@Entity('claim')
export class ClaimEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => BatchEntity,
    batch => batch.claims,
  )
  batch: BatchEntity;

  @Column()
  @Index()
  address: string;

  @Column({ name: 'number_of_tokens' })
  numberOfTokens: number;

  @Column({ name: 'claim_date' })
  claimDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ default: ClaimStatus.Added })
  status: ClaimStatus;
}
