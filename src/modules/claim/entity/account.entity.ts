import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { RewardEntity } from './reward.entity';

@Entity('account')
export class AccountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  address: string;

  @Column({ default: 0 })
  availableToBeClaimed: number;

  @Column({ default: 0 })
  totalLocked: number;

  @Column({ default: 0 })
  totalClaimed: number;

  @OneToMany(
    type => RewardEntity,
    reward => reward.address,
  )
  rewards: RewardEntity[];
}
