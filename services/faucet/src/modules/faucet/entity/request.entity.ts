import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('requests')
export class RequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  address: string;

  @Column()
  @Index()
  ipv4: string;

  @Column()
  @Index()
  txHash: string;

  @Column()
  amount: number;

  @CreateDateColumn()
  createdAt: Date;
}
