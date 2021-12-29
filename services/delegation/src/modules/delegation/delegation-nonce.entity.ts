import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Node } from '../node/node.entity';

@Entity({
  name: 'delegation_nonces',
})
export class DelegationNonce {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user: number;

  @Column()
  @Index()
  address: string;

  @ManyToOne(() => Node, {
    eager: true,
  })
  node: Node;

  @Column()
  value: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
