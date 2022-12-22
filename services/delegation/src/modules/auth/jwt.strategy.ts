import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { JwtPayload } from "./jwt-payload.type";
import jwtConfig from "./../../config/jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    config: ConfigType<typeof jwtConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.secret,
    });
  }

  async validate(payload: JwtPayload) {
    return { id: payload.id };
  }
}
