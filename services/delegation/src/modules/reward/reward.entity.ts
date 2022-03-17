import { PrimaryGeneratedColumn, Entity, Column, Index } from 'typeorm';
import { RewardType } from './reward-type.enum';

@Entity({
  name: 'rewards',
})
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user: number;

  @Column()
  @Index()
  node: number;

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

  isNode(): boolean {
    return this.type === RewardType.NODE;
  }

  isDelegator(): boolean {
    return this.type === RewardType.DELEGATOR;
  }
}
