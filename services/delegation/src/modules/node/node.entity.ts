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
  DeleteDateColumn,
  AfterLoad,
  getRepository,
} from 'typeorm';
import { Delegation } from '../delegation/delegation.entity';
import { CreateNodeDto } from './dto/create-node.dto';
import { NodeCommission } from './node-commission.entity';
import { NodeType } from './node-type.enum';
import { TopUser } from './top-user.entity';
import { Profile } from '../profile/profile.entity';

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
  firstBlockCreatedAt?: Date;

  @Column({
    nullable: true,
    default: null,
  })
  lastBlockCreatedAt?: Date;

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

  @DeleteDateColumn({
    type: 'timestamp with time zone',
  })
  deletedAt?: Date;

  profile: Partial<Profile> | null = null;
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
  canDelete = false;
  isOwnValidator = false;

  @AfterLoad()
  calculateCommission = () => {
    if (this.isTestnet()) {
      return;
    }

    if (!this.commissions) {
      return;
    }

    const commissions = this.commissions.sort(
      (a: NodeCommission, b: NodeCommission) => a.id - b.id,
    );

    const now = moment().utc();
    for (const commission of commissions) {
      const startsAt = moment(commission.startsAt).utc();
      if (startsAt.isBefore(now)) {
        this.currentCommission = commission.value;
      }
      if (startsAt.isAfter(now)) {
        this.hasPendingCommissionChange = true;
        this.pendingCommission = commission.value;
      }
    }
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
  getProfile = async () => {
    if (this.isTestnet()) {
      return;
    }

    this.profile = await getRepository(Profile).findOne({
      user: this.user,
    });
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

  @AfterLoad()
  calculateCanDelete = async () => {
    if (this.isTestnet()) {
      this.canDelete = true;
      return;
    }

    const delegations = await getRepository(Delegation).find({
      where: {
        node: this,
      },
      withDeleted: true,
    });

    if (!this.delegations) {
      return;
    }

    if (this.delegations.length === 0) {
      this.canDelete = true;
    }
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

  isUserOwnValidator(user: number | null): boolean {
    return this.delegations.some((delegation) => delegation.user === user);
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
