import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
} from 'typeorm';
import { IRequest } from '../../../models';

export enum RequestStatus {
  CREATED = 'CREATED',
  DRIPPED = 'DRIPPED',
  FAILED = 'FAILED',
}

@Entity('requests')
export class RequestEntity implements IRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'uuid',
  })
  @Index({
    unique: true,
  })
  @Generated('uuid')
  uuid: string;

  @Column()
  @Index()
  address: string;

  @Column()
  @Index()
  ip: string;

  @Column()
  amount: number;

  @Column()
  txHash?: string;

  @Column({
    type: 'enum',
    enumName: 'request_status',
    enum: RequestStatus,
    default: RequestStatus.CREATED,
  })
  status: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
  })
  updatedAt: Date;
}
