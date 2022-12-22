import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CreateProfileDto } from "./dto/create-profile.dto";

@Entity({
  name: "profiles",
})
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  user: number;

  @Column({
    type: "text",
    nullable: true,
    default: null,
  })
  description: string;

  @Column({
    type: "text",
    nullable: true,
    default: null,
  })
  website: string;

  @Column({
    type: "text",
    nullable: true,
    default: null,
  })
  social: string;

  @CreateDateColumn({
    type: "timestamp with time zone",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp with time zone",
  })
  updatedAt: Date;

  static fromDto(profileDto: CreateProfileDto): Profile {
    const profile = new Profile();
    if (profileDto.description) {
      profile.description = profileDto.description;
    }

    if (profileDto.website) {
      profile.website = profileDto.website;
    }

    if (profileDto.social) {
      profile.social = profileDto.social;
    }

    return profile;
  }
}
