import { IDAG } from '@taraxa_project/taraxa-models';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
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
  @PrimaryColumn()
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

  @ManyToMany(() => TransactionEntity, (transaction) => transaction.dagBlocks)
  transactions!: TransactionEntity[];
}
