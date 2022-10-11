import { IPBFT } from '@taraxa_project/taraxa-models';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsString, IsArray } from 'class-validator';
import TransactionEntity from '../transaction/transaction.entity';

const table_name = 'pbfts';

@Entity(table_name)
export class PbftEntity extends BaseEntity implements IPBFT {
  constructor(pbft?: Partial<IPBFT>) {
    super();
    Object.assign(this, pbft);
  }
  @PrimaryColumn()
  hash: string;

  @Column({ nullable: false })
  @IsNumber()
  @IsNotEmpty()
  @Index()
  number: number;

  @Column({ nullable: false, default: 0 })
  @IsNumber()
  @IsNotEmpty()
  @Index()
  timestamp: number;

  @Column({ nullable: true })
  @IsString()
  nonce?: string;

  @Column({ nullable: true })
  @IsString()
  @Index()
  miner?: string;

  @Column({ nullable: true, type: 'bigint' })
  @IsNumber()
  reward?: number;

  @Column({ nullable: true, type: 'bigint' })
  @IsNumber()
  gasLimit?: string;

  @Column({ nullable: true, type: 'bigint' })
  @IsNumber()
  gasUsed?: string;

  @Column({ nullable: true })
  @IsString()
  parent?: string;

  @Column({ nullable: true })
  @IsNumber()
  difficulty?: number;

  @Column({ nullable: true })
  @IsNumber()
  totalDifficulty?: number;

  @Column({ nullable: true })
  @IsNumber()
  transactionCount?: number;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.block)
  transactions?: TransactionEntity[];
}
