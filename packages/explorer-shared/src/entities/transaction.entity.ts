import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import { ITransaction } from '../models';
import { PbftEntity } from './pbft.entity';

@Entity('transactions')
export class TransactionEntity extends BaseEntity implements ITransaction {
  constructor(transaction?: Partial<ITransaction>) {
    super();
    Object.assign(this, transaction);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index('transactions_index_hash')
  @IsString()
  hash: string;

  @Column({ nullable: true })
  @IsNumber()
  nonce?: number;

  @Column({ nullable: true })
  @IsNumber()
  index?: number;

  @Column({ nullable: true })
  @IsString()
  value?: string;

  @Column({ nullable: true })
  @IsString()
  gasPrice?: string;

  @Column({ nullable: true })
  @IsString()
  gas?: string;

  @Column({ nullable: true })
  @IsString()
  gasUsed?: string;

  @Column({ nullable: true })
  @IsNumber()
  cumulativeGasUsed?: number;

  @Column({ nullable: true })
  @IsString()
  inputData?: string;

  @Index('transactions_index_blockId')
  @ManyToOne(() => PbftEntity, (pbft) => pbft.transactions, {
    onDelete: 'CASCADE',
  })
  block?: PbftEntity;

  @Column({ nullable: true })
  @IsNumber()
  status?: number;

  @Column({ nullable: true })
  @Index('transactions_index_from')
  @IsString()
  from?: string;

  @Column({ nullable: true })
  @Index('transactions_index_to')
  @IsString()
  to?: string;

  @Column({ nullable: true })
  @IsString()
  v?: string;

  @Column({ nullable: true })
  @IsString()
  r?: string;

  @Column({ nullable: true })
  @IsString()
  s?: string;

  @Column({ nullable: true })
  @IsString()
  blockHash?: string;

  @Column({ nullable: true })
  @IsNumber()
  blockNumber?: number;

  @Column({ nullable: true })
  @IsNumber()
  blockTimestamp?: number;
}
