import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DagModule } from '../dag';
import { LiveSyncerModule } from '../live-sync';
import { PbftModule } from '../pbft';
import { HealthController } from './health.controller';
import { SyncerHealthIndicator } from './SyncerHealthIndicator';

@Module({
  imports: [TerminusModule, PbftModule, DagModule, LiveSyncerModule],
  controllers: [HealthController],
  providers: [SyncerHealthIndicator],
})
export class HealthModule {}
