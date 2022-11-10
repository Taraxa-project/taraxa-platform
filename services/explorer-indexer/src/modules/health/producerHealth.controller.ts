import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheck,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ProducerHealthIndicator } from './producerHealthIndicator';

@Controller('health')
export class ProducerHealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private syncerHealthIndicator: ProducerHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.99,
        }),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
      () => this.syncerHealthIndicator.isHealthy('pbft'),
      () => this.syncerHealthIndicator.isHealthy('dag'),
      () => this.syncerHealthIndicator.isHealthy('queue_pbfts'),
      () => this.syncerHealthIndicator.isHealthy('queue_dags'),
      () => this.syncerHealthIndicator.isHealthy('ws'),
    ]);
  }
}
