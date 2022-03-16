import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('claim')
export class ClaimEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  address: string;

  @Column()
  numberOfTokens: string;

  @Column({ default: false })
  claimed: boolean;

  @Column({ nullable: true })
  claimedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
