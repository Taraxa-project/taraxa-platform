import { APP_GUARD } from "@nestjs/core";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import jwtConfig from "./../../config/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: (config: ConfigService) => ({
        secret: config.get("jwt.secret"),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [],
})
export class AuthModule {}
