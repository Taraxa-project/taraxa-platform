import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DagModule } from '../dag';
import { PbftModule } from '../pbft';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, PbftModule, DagModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
