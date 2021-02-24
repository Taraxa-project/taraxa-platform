import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ClaimEntity } from './claim.entity';

export enum BatchStatus {
  Added,
  Approved,
}

@Entity('batch')
export class BatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ default: BatchStatus.Added })
  status: BatchStatus;

  @OneToMany(
    type => ClaimEntity,
    claim => claim.batch,
    { cascade: true },
  )
  claims: ClaimEntity[];
}
