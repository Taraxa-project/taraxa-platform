import { IDAG, ITransaction } from '@taraxa_project/taraxa-models';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, IsString, IsArray } from 'class-validator';

const table_name = 'dags';

@Entity(table_name)
export class DagEntity extends BaseEntity implements IDAG {
  constructor(dag?: Partial<IDAG>) {
    super();
    Object.assign(this, dag);
  }
  @PrimaryColumn()
  hash: string;

  @Column({ nullable: true })
  @IsString()
  pivot?: string;

  @Column({ nullable: true })
  @IsNumber()
  level?: number;
  @Column({ nullable: true })
  @IsNumber()
  pbftPeriod?: number;
  @Column({ nullable: false })
  @IsNumber()
  @IsNotEmpty()
  timestamp: number;
  @Column({ nullable: true })
  @IsString()
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
}
