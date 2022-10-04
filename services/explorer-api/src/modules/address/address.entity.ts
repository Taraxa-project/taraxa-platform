import { Entity, PrimaryGeneratedColumn, BaseEntity, Column } from 'typeorm';
import { IsString, IsNotEmpty } from 'class-validator';
import { IAccount } from '@taraxa_project/taraxa-models';

const tableName = 'explorer_address';

@Entity(tableName)
export class Address extends BaseEntity implements IAccount {
  constructor(pool?: Partial<Address>) {
    super();
    Object.assign(this, pool);
  }

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  @IsNotEmpty()
  @IsString()
  timestamp!: number;

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
