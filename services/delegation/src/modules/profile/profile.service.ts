import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Profile } from "./profile.entity";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ValidationException } from "../utils/exceptions/validation.exception";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>
  ) {}

  get(user: number): Promise<Profile> {
    return this.profileRepository.findOneOrFail({ user });
  }

  async create(user: number, profileDto: CreateProfileDto): Promise<Profile> {
    const profileExists = await this.profileRepository.findOne({ user });

    if (profileExists) {
      throw new ValidationException(`User already has a profile.`);
    }

    const profile = Profile.fromDto(profileDto);
    profile.user = user;
    return this.profileRepository.save(profile);
  }

  async update(user: number, profileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profileRepository.findOneOrFail({ user });

    if (typeof profileDto.description !== "undefined") {
      profile.description = profileDto.description;
    }

    if (typeof profileDto.website !== "undefined") {
      profile.website = profileDto.website;
    }

    if (typeof profileDto.social !== "undefined") {
      profile.social = profileDto.social;
    }

    return this.profileRepository.save(profile);
  }
}
