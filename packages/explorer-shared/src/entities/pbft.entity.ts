import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IPBFT } from '../models';
import { TransactionEntity } from './transaction.entity';

@Entity('pbfts')
export class PbftEntity extends BaseEntity implements IPBFT {
  constructor(pbft?: Partial<IPBFT>) {
    super();
    Object.assign(this, pbft);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString()
  @Index('pbfts_index_hash')
  hash: string;

  @Column({ nullable: false })
  @IsNumber()
  @IsNotEmpty()
  @Index('pbfts_index_number')
  number: number;

  @Column({ nullable: false, default: 0 })
  @IsNumber()
  @IsNotEmpty()
  @Index('pbfts_index_timestamp')
  timestamp: number;

  @Column({ nullable: true })
  @IsString()
  nonce?: string;

  @Column({ nullable: true })
  @IsString()
  @Index('pbfts_index_miner')
  miner?: string;

  @Column({ nullable: true })
  @IsString()
  reward?: string;

  @Column({ nullable: true })
  @IsString()
  gasLimit?: string;

  @Column({ nullable: true })
  @IsString()
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

  @OneToMany(() => TransactionEntity, (transaction) => transaction.block, {
    cascade: true,
  })
  transactions?: TransactionEntity[];

  @Column({ nullable: true })
  @IsString()
  transactionsRoot?: string;

  @Column({ nullable: true })
  @IsString()
  extraData?: string;

  @Column({ nullable: true })
  @IsString()
  logsBloom?: string;

  @Column({ nullable: true })
  @IsString()
  mixHash?: string;

  @Column({ nullable: true })
  @IsString()
  recepitsRoot?: string;

  @Column({ nullable: true })
  @IsString()
  sha3Uncles?: string;

  @Column({ nullable: true })
  @IsNumber()
  size?: number;

  @Column({ nullable: true })
  @IsString()
  stateRoot?: string;
}
