import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber } from 'class-validator';

@Entity('rewards')
export class RewardsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  @IsNumber()
  rowCount: number;
}
