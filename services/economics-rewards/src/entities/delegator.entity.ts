import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import { Delegator } from '../types';

@Unique(['blockNumber', 'validator', 'blockTimestamp', 'delegator'])
@Entity('delegator')
export class DelegatorEntity implements Delegator {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  @IsNumber()
  blockNumber: number;

  @Column()
  @IsNumber()
  blockTimestamp: number;

  @Column()
  @IsString()
  blockHash: string;

  @Column()
  @Index()
  @IsString()
  validator: string;

  @Column()
  @IsString()
  delegator: string;

  @Column()
  @IsString()
  stake: string;

  @Column()
  @IsString()
  rewards: string;
}
