import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  Index,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CreateNodeDto } from './dto/create-node.dto';
import { NodeCommission } from './node-commission.entity';
import { NodeType } from './node-type.enum';

@Entity({
  name: 'nodes',
})
export class Node {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user: number;

  @Column({
    type: 'enum',
    enum: NodeType,
  })
  @Index()
  type: string;

  @Column({
    nullable: true,
    default: null,
  })
  name: string;

  @Column({
    unique: true,
  })
  address: string;

  @Column({
    nullable: true,
    default: null,
  })
  ip: string;

  @OneToMany(() => NodeCommission, (commission) => commission.node, {
    eager: true,
    cascade: true,
  })
  commissions: NodeCommission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isMainnet(): boolean {
    return this.type === NodeType.MAINNET;
  }

  isTestnet(): boolean {
    return this.type === NodeType.TESTNET;
  }

  static fromDto(dto: CreateNodeDto): Node {
    const node = new Node();
    node.type = dto.type;
    node.address = dto.address;

    if (dto.name) {
      node.name = dto.name;
    }

    if (dto.ip) {
      node.ip = dto.ip;
    }

    return node;
  }
}
