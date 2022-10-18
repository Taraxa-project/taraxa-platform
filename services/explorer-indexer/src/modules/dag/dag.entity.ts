import { IDAG } from '@taraxa_project/explorer-shared';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsString, IsArray } from 'class-validator';
import TransactionEntity from '../transaction/transaction.entity';

const table_name = 'dags';

@Entity(table_name)
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
  @Index()
  pbftPeriod?: number;

  @Column({ nullable: false, default: 0 })
  @IsNumber()
  @IsNotEmpty()
  @Index()
  timestamp: number;

  @Column({ nullable: true })
  @IsString()
  @Index()
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

  @ManyToMany(() => TransactionEntity, (transaction) => transaction.dagBlocks, {
    cascade: false,
  })
  transactions: TransactionEntity[];
}
