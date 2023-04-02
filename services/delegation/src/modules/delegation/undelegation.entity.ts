import { ethers } from 'ethers';
import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { NodeType } from '../node/node-type.enum';
import { Node } from '../node/node.entity';
import { CreateUndelegationDto } from './dto/create-undelegation.dto';

@Entity({
  name: 'undelegations',
})
export class Undelegation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @Index()
  address: string;

  @Column({ nullable: false, default: false })
  triggered: boolean; // set when the undelegate method was called for this entity

  @Column({ nullable: false, default: false })
  confirmed: boolean; // set when the confirmUdelegation method was called for this entity

  @Column({ nullable: false })
  chain: NodeType;

  @Column({ nullable: true })
  @Index()
  creationBlock: number | null;

  @Column({ nullable: true })
  @Index()
  confirmationBlock: number | null;

  @ManyToOne(() => Node)
  node: Node;

  @Column({ nullable: false })
  value: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
  })
  updatedAt: Date;

  static fromDto(dto: CreateUndelegationDto): Undelegation {
    const delegation = new Undelegation();
    delegation.address = dto.from;
    delegation.value = ethers.BigNumber.from(dto.value).toString();
    return delegation;
  }
}
