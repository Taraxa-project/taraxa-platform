import {
  Entity,
  BaseEntity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ITaraxaNode } from '@taraxa_project/taraxa-models';

const tableName = 'explorer_node';

@Entity(tableName)
export class TaraxaNode extends BaseEntity implements ITaraxaNode {
  constructor(node?: Partial<ITaraxaNode>) {
    super();
    Object.assign(this, node);
  }

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  @IsNotEmpty()
  @IsString()
  address!: string;

  @Column({ nullable: false, default: 0 })
  @IsNotEmpty()
  @IsNumber()
  lastBlockNumber!: number;

  @Column({ nullable: false, default: 0 })
  @IsNotEmpty()
  @IsNumber()
  pbftCount!: number;

  @Column({ nullable: false, default: 0 })
  @IsNotEmpty()
  @IsNumber()
  dagCount!: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: string;
}
