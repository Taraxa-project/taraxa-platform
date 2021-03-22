import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UnlockerModule } from '@taraxa-claim/unlocker';
import { GeneralModule } from './general.module';

@Module({
  imports: [GeneralModule, ScheduleModule.forRoot(), UnlockerModule],
})
export class CronModule {}
