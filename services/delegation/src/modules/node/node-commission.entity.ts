import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';
import * as moment from 'moment';
import { Node } from './node.entity';

@Entity({
  name: 'node_commissions',
})
export class NodeCommission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  value: number;

  @ManyToOne(() => Node)
  node: Node;

  @Column()
  startsAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  static fromValue(value: number): NodeCommission {
    const commission = new NodeCommission();
    commission.value = value;
    return commission;
  }

  static fromValueCreate(value: number): NodeCommission {
    const commission = NodeCommission.fromValue(value);
    commission.startsAt = moment().utc().toDate();
    return commission;
  }

  static fromValueUpdate(value: number): NodeCommission {
    const commission = NodeCommission.fromValue(value);
    commission.startsAt = moment().add(5, 'days').utc().toDate();
    return commission;
  }
}
