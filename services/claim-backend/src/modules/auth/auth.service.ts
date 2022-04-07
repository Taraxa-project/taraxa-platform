import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { auth } from '@taraxa-claim/config';
import { LoginDto } from './dto/login.dto';
import { AuthEntity } from './entity/auth.entity';
import { JwtInterface } from './interface/jwt.interface';
import { JwtPayloadInterface } from './interface/jwt-payload.interface';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    @Inject(auth.KEY)
    private readonly authConfig: ConfigType<typeof auth>,
    private jwtService: JwtService,
  ) {}
  public async login(login: LoginDto): Promise<JwtInterface> {
    const { email, password } = login;

    const auth = await this.authRepository.findOne({ email });
    if (!auth) {
      throw new Error('Invalid credential');
    }

    const compare = await bcrypt.compare(password, auth.password);
    if (!compare) {
      throw new Error('Invalid credential');
    }

    return this.createToken(auth);
  }
  public createToken(auth: AuthEntity): JwtInterface {
    const { tokenExpiry } = this.authConfig;

    const jwtUser: JwtPayloadInterface = {
      id: auth.id,
      email: auth.email,
    };

    return {
      token: {
        accessToken: this.jwtService.sign(jwtUser),
        expiresIn: tokenExpiry,
      },
    };
  }
  async getUser(id: number): Promise<AuthEntity> {
    return await this.authRepository.findOne({
      id,
    });
  }
}
