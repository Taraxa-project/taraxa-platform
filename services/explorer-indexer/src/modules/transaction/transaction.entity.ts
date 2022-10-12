import { ITransaction } from '@taraxa_project/taraxa-models';
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import { PbftEntity } from '../pbft/pbft.entity';
import { DagEntity } from '../dag/dag.entity';

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

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
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

  @ManyToOne(() => PbftEntity, (pbft) => pbft.transactions)
  block?: PbftEntity;

  @ManyToMany(() => DagEntity, (dag) => dag.transactions, {
    cascade: false,
  })
  @JoinTable()
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
