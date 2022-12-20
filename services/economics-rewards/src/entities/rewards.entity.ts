import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import { Reward } from '../types';

@Entity('rewards')
export class RewardsEntity implements Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNumber()
  blockNumber: number;

  @Column()
  @IsNumber()
  blockTimestamp: number;

  @Column()
  @IsString()
  blockHash: string;

  @Column()
  @IsString()
  account: string;

  @Column()
  @IsString()
  commission: string;

  @Column()
  @IsString()
  commissionReward: string;
}
