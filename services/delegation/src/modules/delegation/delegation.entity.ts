import moment from "moment";
import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  Index,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from "typeorm";
import { Node } from "../node/node.entity";
import { CreateDelegationDto } from "./dto/create-delegation.dto";

@Entity({
  name: "delegations",
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

  @ManyToOne(() => Node)
  node: Node;

  @Column()
  value: number;

  @Column({
    type: "timestamp with time zone",
    nullable: true,
  })
  startsAt?: Date;

  @Column({
    type: "timestamp with time zone",
    nullable: true,
  })
  endsAt?: Date;

  @CreateDateColumn({
    type: "timestamp with time zone",
  })
  createdAt: Date;

  @DeleteDateColumn({
    type: "timestamp with time zone",
  })
  deletedAt?: Date;

  isOwnDelegation: boolean;
  isSelfDelegation: boolean;

  static fromDto(dto: CreateDelegationDto): Delegation {
    const delegation = new Delegation();
    delegation.address = dto.from;
    delegation.value = dto.value;
    delegation.startsAt = moment().utc().toDate();

    return delegation;
  }
}
