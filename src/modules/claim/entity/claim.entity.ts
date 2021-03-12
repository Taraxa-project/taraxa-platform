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
  numberOfTokens: number;

  @Column({ default: false })
  claimed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
