import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsString, IsArray } from 'class-validator';
import { IDAG } from '../models';
import { TransactionEntity } from './transaction.entity';

@Entity('dags')
export class DagEntity extends BaseEntity implements IDAG {
  constructor(dag?: Partial<IDAG>) {
    super();
    Object.assign(this, dag);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString()
  hash: string;

  @Column({ nullable: true })
  @IsString()
  pivot?: string;

  @Column('simple-array', { nullable: true })
  @IsArray()
  tips?: string[];

  @Column({ nullable: true })
  @IsNumber()
  level?: number;

  @Column({ nullable: true })
  @IsNumber()
  @Index('dags_index_pbftPeriod')
  pbftPeriod?: number;

  @Column({ nullable: false, default: 0 })
  @IsNumber()
  @IsNotEmpty()
  @Index('dags_index_timestamp')
  timestamp: number;

  @Column({ nullable: true })
  @IsString()
  @Index('dags_index_author')
  author?: string;

  @Column({ nullable: true })
  @IsString()
  signature?: string;

  @Column({ nullable: true })
  @IsNumber()
  vdf?: number;

  @Column({ nullable: true })
  @IsNumber()
  transactionCount?: number;

  @ManyToMany(() => TransactionEntity, {
    cascade: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'transactions_dags',
  })
  transactions: TransactionEntity[];
}
