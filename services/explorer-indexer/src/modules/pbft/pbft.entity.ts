import { IPBFT, ITransaction } from '@taraxa_project/taraxa-models';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, IsString, IsArray } from 'class-validator';

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
  number: number;

  @Column({ nullable: false })
  @IsNumber()
  @IsNotEmpty()
  timestamp: number;

  @Column({ nullable: true })
  @IsString()
  nonce?: string;

  @Column({ nullable: true })
  @IsString()
  miner?: string;

  @Column({ nullable: true })
  @IsNumber()
  gasLimit?: number;

  @Column({ nullable: true })
  @IsNumber()
  gasUsed?: number;

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
  @Column({ nullable: true })
  @IsArray()
  transactions?: ITransaction[];
}
