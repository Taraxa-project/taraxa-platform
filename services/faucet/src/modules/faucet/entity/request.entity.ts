import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { IRequest } from '../../../models';

@Entity('requests')
export class RequestEntity implements IRequest {
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
