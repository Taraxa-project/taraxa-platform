import { Body, Controller, Get, Post, Put } from '@nestjs/common';
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
  createProfile(
    @User() user: JwtUser,
    @Body() profile: CreateProfileDto,
  ): Promise<Profile> {
    return this.profileService.create(user.id, profile);
  }

  @ApiOkResponse({
    description: 'The profile has been successfully updated',
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Put()
  updateProfile(
    @User() user: JwtUser,
    @Body() profile: UpdateProfileDto,
  ): Promise<Profile> {
    return this.profileService.update(user.id, profile);
  }

  @ApiOkResponse({ description: 'Profile found' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get()
  getProfile(@User() user: JwtUser): Promise<Profile> {
    return this.profileService.get(user.id);
  }
}
