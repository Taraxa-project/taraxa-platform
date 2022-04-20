import { PrimaryGeneratedColumn, Entity, Column, Index } from 'typeorm';

@Entity({
  name: 'users-permissions_user',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({
    unique: true,
  })
  username: string;

  @Column({
    name: 'eth_wallet',
    nullable: true,
  })
  ethWallet?: string;

  @Column({
    nullable: true,
  })
  kyc?: string;
}
