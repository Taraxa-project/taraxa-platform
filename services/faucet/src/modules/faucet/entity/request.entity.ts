import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('request')
export class RequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  address: string;

  @Column()
  amount: number;

  @Column()
  @Index()
  txHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
