import * as moment from 'moment';
import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  Index,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
} from 'typeorm';
import { Delegation } from '../delegation/delegation.entity';
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

  @Column({
    nullable: true,
    default: null,
  })
  blocksProduced: number | null;

  @Column({
    nullable: true,
    default: null,
  })
  weeklyBlocksProduced: number | null;

  @Column({
    nullable: true,
    default: null,
  })
  weeklyRank: number | null;

  @Column({
    nullable: true,
    default: null,
  })
  lastBlockCreatedAt: Date | null;

  @OneToMany(() => NodeCommission, (commission) => commission.node, {
    eager: true,
    cascade: true,
  })
  commissions: NodeCommission[];

  @OneToMany(() => Delegation, (delegation) => delegation.node, {
    eager: true,
  })
  delegations: Delegation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  currentCommission: number;
  pendingCommission: number | null;
  hasPendingCommissionChange: boolean;
  totalDelegation: number;
  yield: number;
  remainingDelegation: number;

  @AfterLoad()
  calculateCommission = () => {
    if (this.isTestnet()) {
      this.currentCommission = 0;
      this.pendingCommission = null;
      this.hasPendingCommissionChange = false;
      return;
    }

    let hasPendingCommissionChange = false;

    const now = moment().utc().toDate().getTime();

    for (const commission of this.commissions) {
      const startsAt = moment(commission.startsAt).toDate().getTime();
      if (startsAt > now) {
        hasPendingCommissionChange = true;
        this.pendingCommission = commission.value;
        break;
      }
    }

    for (const commission of this.commissions.reverse()) {
      const startsAt = moment(commission.startsAt).toDate().getTime();
      if (startsAt < now) {
        this.currentCommission = commission.value;
        break;
      }
    }

    this.hasPendingCommissionChange = hasPendingCommissionChange;
  };

  @AfterLoad()
  calculateDelegated = () => {
    this.yield = 0;
    this.remainingDelegation = 0;
    if (this.isTestnet()) {
      this.totalDelegation = 0;
      return;
    }

    this.totalDelegation = this.delegations.reduce(
      (acc, delegation) => acc + delegation.value,
      0,
    );
  };

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
