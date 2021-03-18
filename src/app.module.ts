import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { general, database, auth, ethereum } from '@taraxa-claim/config';
import { AuthModule } from '@taraxa-claim/auth';
import { ClaimModule } from '@taraxa-claim/claim';
import { UnlockerModule } from '@taraxa-claim/unlocker';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [general, database, auth, ethereum],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.pass'),
        database: configService.get<string>('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    ClaimModule,
    UnlockerModule,
  ],
})
export class AppModule {}
