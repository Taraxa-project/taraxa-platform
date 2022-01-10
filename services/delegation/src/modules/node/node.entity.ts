import moment from 'moment';
import * as ethers from 'ethers';
import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  Index,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
  getRepository,
} from 'typeorm';
import { Delegation } from '../delegation/delegation.entity';
import { CreateNodeDto } from './dto/create-node.dto';
import { NodeCommission } from './node-commission.entity';
import { NodeType } from './node-type.enum';
import { TopUser } from './top-user.entity';

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
  name: string | null = null;

  @Column({
    unique: true,
  })
  address: string;

  @Column({
    nullable: true,
    default: null,
  })
  ip: string | null = null;

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

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
  })
  updatedAt: Date;

  yield = 0;
  currentCommission = 0;
  pendingCommission: number | null = null;
  hasPendingCommissionChange = false;
  totalDelegation = 0;
  remainingDelegation = 0;
  ownDelegation = 0;
  isActive = false;
  isTopNode = false;
  canUndelegate = false;

  @AfterLoad()
  calculateCommission = () => {
    if (this.isTestnet()) {
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
    if (this.isTestnet()) {
      return;
    }

    if (!this.delegations) {
      return;
    }

    this.totalDelegation = this.delegations.reduce(
      (acc, delegation) => acc + delegation.value,
      0,
    );

    this.ownDelegation = this.delegations.reduce((acc, delegation) => {
      if (delegation.user === this.user) {
        return acc + delegation.value;
      }
      return acc;
    }, 0);
  };

  @AfterLoad()
  calculateTopNode = async () => {
    if (this.isTestnet()) {
      return;
    }

    const topNode = await getRepository(TopUser).findOne({
      user: this.user,
    });

    if (topNode) {
      this.isTopNode = true;
    }
  };

  @AfterLoad()
  calculateIsActive = () => {
    if (this.lastBlockCreatedAt === null) {
      return;
    }

    const threshold = moment()
      .utc()
      .subtract(24, 'hours')
      .utc()
      .toDate()
      .getTime();
    this.isActive =
      moment(this.lastBlockCreatedAt).utc().toDate().getTime() > threshold;
  };

  isMainnet(): boolean {
    return this.type === NodeType.MAINNET;
  }

  isTestnet(): boolean {
    return this.type === NodeType.TESTNET;
  }

  canUserUndelegate(user: number | null): boolean {
    return this.delegations.some(
      (delegation) =>
        delegation.user === user &&
        moment()
          .utc()
          .isAfter(moment(delegation.createdAt).utc().add(5, 'days').utc()),
    );
  }

  static fromDto(dto: CreateNodeDto): Node {
    const node = new Node();
    node.type = dto.type;
    node.address = ethers.utils.getAddress(dto.address);

    if (typeof dto.name !== 'undefined' && dto.name !== '') {
      node.name = dto.name;
    }

    if (typeof dto.ip !== 'undefined') {
      node.ip = dto.ip;
    }

    return node;
  }
}
