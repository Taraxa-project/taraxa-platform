import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../user/user.decorator';
import { JwtUser } from '../user/jwt-user.type';
import { Profile } from './profile.entity';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileAlreadyExistsException } from './exceptions/profile-already-exists.exception';
import { ProfileNotFoundException } from './exceptions/profile-not-found.exception';

@ApiTags('profiles')
@ApiSecurity('bearer')
@Controller('profiles')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @ApiCreatedResponse({
    description: 'The profile has been successfully created',
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post()
  async createProfile(
    @User() user: JwtUser,
    @Body() profile: CreateProfileDto,
  ): Promise<Profile> {
    try {
      return await this.profileService.create(user.id, profile);
    } catch (e) {
      if (e instanceof ProfileAlreadyExistsException) {
        throw new BadRequestException(e.message);
      } else {
        throw e;
      }
    }
  }

  @ApiOkResponse({
    description: 'The profile has been successfully updated',
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Put()
  async updateProfile(
    @User() user: JwtUser,
    @Body() profile: UpdateProfileDto,
  ): Promise<Profile> {
    try {
      return await this.profileService.update(user.id, profile);
    } catch (e) {
      if (e instanceof ProfileNotFoundException) {
        throw new BadRequestException(e.message);
      } else {
        throw e;
      }
    }
  }

  @ApiOkResponse({ description: 'Profile found' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get()
  async getProfile(@User() user: JwtUser): Promise<Profile> {
    try {
      return await this.profileService.get(user.id);
    } catch (e) {
      if (e instanceof ProfileNotFoundException) {
        throw new NotFoundException(e.message);
      } else {
        throw e;
      }
    }
  }
}
