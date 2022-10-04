import { Entity, BaseEntity, Column, PrimaryColumn } from 'typeorm';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ITaraxaNode } from '@taraxa_project/taraxa-models';

const tableName = 'explorer_node';

@Entity(tableName)
export class TaraxaNode extends BaseEntity implements ITaraxaNode {
  constructor(node?: Partial<ITaraxaNode>) {
    super();
    Object.assign(this, node);
  }

  @PrimaryColumn()
  id!: string;

  @Column({ nullable: false })
  @IsNotEmpty()
  @IsNumber()
  lastBlockNumber!: number;

  @Column({ nullable: false })
  @IsNotEmpty()
  @IsNumber()
  count!: number;

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
