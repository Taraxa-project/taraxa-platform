import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './public.decorator';
import { User } from './user.entity';
import { UserService } from './user.service';

@ApiTags('User Authorization')
@Controller('/user-auth')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:address')
  @Public()
  public async getUserByAddress(@Param() address: string): Promise<User> {
    return await this.userService.getUserByAddress(address);
  }
}
