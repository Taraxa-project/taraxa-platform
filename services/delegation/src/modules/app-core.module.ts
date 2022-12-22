import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { DynamicModule, Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bull";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";

import generalConfig from "../config/general";
import databaseConfig from "../config/database";
import queueConfig from "../config/queue";

import { AuthModule } from "./auth/auth.module";
import { NodeModule } from "./node/node.module";
import { ProfileModule } from "./profile/profile.module";
import { UserModule } from "./user/user.module";
import { RewardModule } from "./reward/reward.module";
import { DelegationModule } from "./delegation/delegation.module";
import { HttpExceptionFilter } from "./utils/http-exception.filter";

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === "prod",
      load: [generalConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get("database.host"),
        port: config.get<number>("database.port"),
        username: config.get("database.user"),
        password: config.get("database.pass"),
        database: config.get("database.nameDelegation"),
        autoLoadEntities: true,
        synchronize: !config.get<boolean>("isProd"),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      name: "communityConnection",
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: (config: ConfigService) => ({
        name: "communityConnection",
        type: "postgres",
        host: config.get("database.host"),
        port: config.get<number>("database.port"),
        username: config.get("database.user"),
        password: config.get("database.pass"),
        database: config.get("database.nameCommunity"),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule.forFeature(queueConfig)],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get("queue.host"),
          port: config.get("queue.port"),
          password: config.get("queue.pass"),
          prefix: config.get("queue.prefix"),
        },
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    ProfileModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppCoreModule {
  static forRoot(type = "web"): DynamicModule {
    return {
      module: AppCoreModule,
      imports: [
        NodeModule.forRoot(type),
        DelegationModule.forRoot(type),
        RewardModule.forRoot(type),
      ],
    };
  }
}
