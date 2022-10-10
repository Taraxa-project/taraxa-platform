import { ITransaction } from '@taraxa_project/taraxa-models';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { IsNumber, IsString, IsArray } from 'class-validator';
import { PbftEntity } from '../pbft';
import { DagEntity } from '../dag';

const table_name = 'transactions';

@Entity(table_name)
export default class TransactionEntity
  extends BaseEntity
  implements ITransaction
{
  constructor(transaction?: Partial<ITransaction>) {
    super();
    Object.assign(this, transaction);
  }

  @PrimaryColumn()
  @IsString()
  hash: string;

  @Column({ nullable: true })
  @IsString()
  nonce?: number;

  @Column({ nullable: true })
  @IsNumber()
  index?: number;

  @Column({ nullable: true })
  @IsNumber()
  value?: number;

  @Column({ nullable: true, type: 'bigint' })
  @IsNumber()
  gasPrice?: string;
  @Column({ nullable: true, type: 'bigint' })
  @IsNumber()
  gas?: string;

  @Column({ nullable: true, type: 'bigint' })
  @IsNumber()
  gasUsed?: string;

  @Column({ nullable: true, type: 'bigint' })
  @IsNumber()
  cumulativeGasUsed?: number;

  @Column({ nullable: true })
  @IsString()
  inputData?: string;

  @ManyToOne(() => PbftEntity, (pbft) => pbft.transactions)
  @Column({ nullable: true })
  @IsString()
  block?: PbftEntity;

  @ManyToMany(() => DagEntity, (dag) => dag.transactions)
  @Column('simple-array', { nullable: true })
  @IsArray()
  dagBlocks?: DagEntity[];

  @Column({ nullable: true })
  @IsNumber()
  status?: number;

  @Column({ nullable: true })
  @IsString()
  from?: string;

  @Column({ nullable: true })
  @IsString()
  to?: string;
}
