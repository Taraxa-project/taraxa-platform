import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PbftModule } from '../pbft';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, PbftModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
