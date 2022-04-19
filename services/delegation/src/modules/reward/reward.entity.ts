import { PrimaryGeneratedColumn, Entity, Column, Index } from 'typeorm';
import { RewardType } from './reward-type.enum';

@Entity({
  name: 'rewards',
})
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  @Index()
  user?: number;

  @Column({
    name: 'user_address',
    nullable: true,
  })
  @Index()
  userAddress?: string;

  @Column({
    nullable: true,
  })
  @Index()
  node?: number | null;

  @Column({
    type: 'enum',
    enum: RewardType,
  })
  @Index()
  type: string;

  @Column()
  epoch: number;

  @Column({
    type: 'double precision',
  })
  value: number;

  @Column({
    type: 'timestamp with time zone',
  })
  startsAt: Date;

  @Column({
    type: 'timestamp with time zone',
  })
  endsAt: Date;

  isStaking(): boolean {
    return this.type === RewardType.STAKING;
  }

  isNode(): boolean {
    return this.type === RewardType.NODE;
  }

  isDelegator(): boolean {
    return this.type === RewardType.DELEGATOR;
  }
}
