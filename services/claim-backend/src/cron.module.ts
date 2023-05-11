import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UnlockerModule } from '@taraxa-claim/unlocker';
import { GeneralModule } from './general.module';
import { ClaimModule } from './modules/claim/claim.module';

@Module({
  imports: [
    GeneralModule,
    ScheduleModule.forRoot(),
    UnlockerModule,
    ClaimModule.forRoot('cron'),
  ],
})
export class CronModule {}
