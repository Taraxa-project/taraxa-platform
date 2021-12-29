import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileAlreadyExistsException } from './exceptions/profile-already-exists.exception';
import { ProfileNotFoundException } from './exceptions/profile-not-found.exception';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  async get(user: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ user });

    if (!profile) {
      throw new ProfileNotFoundException(user);
    }

    return profile;
  }

  async create(user: number, profileDto: CreateProfileDto): Promise<Profile> {
    const profileExists = await this.profileRepository.findOne({ user });

    if (profileExists) {
      throw new ProfileAlreadyExistsException(user);
    }

    const profile = Profile.fromDto(profileDto);
    profile.user = user;
    return this.profileRepository.save(profile);
  }

  async update(user: number, profileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ user });

    if (!profile) {
      throw new ProfileNotFoundException(user);
    }

    if (typeof profileDto.description !== 'undefined') {
      profile.description = profileDto.description;
    }

    if (typeof profileDto.website !== 'undefined') {
      profile.website = profileDto.website;
    }

    if (typeof profileDto.social !== 'undefined') {
      profile.social = profileDto.social;
    }

    return this.profileRepository.save(profile);
  }
}
