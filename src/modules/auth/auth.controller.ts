import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtInterface } from './interface/jwt.interface';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async login(@Body() login: LoginDto): Promise<JwtInterface> {
    try {
      return await this.authService.login(login);
    } catch (err) {
      throw new UnauthorizedException(err.toString());
    }
  }

  @Get('restricted')
  @ApiResponse({
    status: 200,
    description: 'Success! You are logged in',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async restricted(): Promise<string> {
    return 'should not see this';
  }
}
