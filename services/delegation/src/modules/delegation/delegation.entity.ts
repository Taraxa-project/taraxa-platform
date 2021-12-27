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
import { CreateDelegationDto } from './dto/create-delegation.dto';

@Entity({
  name: 'delegations',
})
export class Delegation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user: number;

  @Column()
  @Index()
  address: string;

  @ManyToOne(() => Node, (node) => node.delegations, {
    eager: true,
    cascade: true,
  })
  node: Node;

  @Column()
  value: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static fromDto(dto: CreateDelegationDto): Delegation {
    const delegation = new Delegation();
    delegation.address = dto.from;
    delegation.value = dto.value;

    return delegation;
  }
}
