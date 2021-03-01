import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ClaimEntity } from './claim.entity';

@Entity('batch')
export class BatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ default: false })
  status: boolean;

  @OneToMany(
    type => ClaimEntity,
    claim => claim.batch,
    { cascade: true, onDelete: 'CASCADE' },
  )
  claims: ClaimEntity[];
}
