import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import { Validator } from '../types';

@Unique(['blockNumber', 'account', 'blockTimestamp'])
@Entity('validator')
// Might be a good idea to create a composed unique key with blockNumber, account etc. so we ignore duplicates
export class ValidatorEntity implements Validator {
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
  account: string;

  @Column()
  @IsString()
  commission: string;

  @Column()
  @IsString()
  commissionReward: string;
}
