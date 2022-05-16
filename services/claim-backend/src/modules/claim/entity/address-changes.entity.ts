import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('address_changes')
export class AddressChangesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'old_address' })
  @Index({ unique: true })
  oldAddress: string;

  @Column({ name: 'new_address' })
  @Index({ unique: true })
  newAddress: string;
}
