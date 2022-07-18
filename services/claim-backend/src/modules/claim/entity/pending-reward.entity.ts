import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { BatchEntity } from './batch.entity';

@Entity('pending_reward')
export class PendingRewardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BatchEntity, (batch: BatchEntity) => batch.pendingRewards, {
    onDelete: 'CASCADE',
  })
  batch: BatchEntity;

  @Column()
  @Index()
  address: string;

  @Column({
    default: '0',
  })
  claimable: string;

  @Column({
    default: '0',
  })
  total: string;

  @Column({
    name: 'community_total',
    default: '0',
  })
  communityTotal: string;

  @Column({
    name: 'delegation_total',
    default: '0',
  })
  delegationTotal: string;

  @Column({
    default: false,
  })
  isValid: boolean;

  @Column({
    nullable: true,
  })
  invalidReason: string | null;
}
