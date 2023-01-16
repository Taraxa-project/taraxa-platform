import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import DagService from '../dag/dag.service';
import PbftService from '../pbft/pbft.service';

@Injectable()
export class SyncerHealthIndicator extends HealthIndicator {
  constructor(
    private readonly pbftService: PbftService,
    private readonly dagService: DagService
  ) {
    super();
  }

  async isHealthy(
    key: 'pbft' | 'dag' | 'queue_pbfts' | 'queue_dags' | 'ws'
  ): Promise<HealthIndicatorResult> {
    switch (key) {
      case 'pbft': {
        const lastPbftHash = await this.pbftService.getLastPbftHash();

        const isHealthy = lastPbftHash != undefined && lastPbftHash != null;
        const result = this.getStatus(key, isHealthy, { lastPbftHash });
        if (lastPbftHash) {
          return result;
        }
        throw new HealthCheckError('Last PBFT block is undefined', result);
      }
      case 'dag': {
        const lastDagHash = await this.dagService.getLastDagHash();

        const isHealthy = lastDagHash != undefined && lastDagHash != null;
        const result = this.getStatus(key, isHealthy, { lastDagHash });
        if (lastDagHash) {
          return result;
        }
        throw new HealthCheckError('Last PBFT block is undefined', result);
      }
      case 'queue_pbfts': {
        if (this.pbftService) {
          return this.getStatus(
            key,
            this.pbftService.getRedisConnectionState()
          );
        }
        break;
      }
      case 'queue_dags': {
        if (this.dagService) {
          return this.getStatus(key, this.dagService.getRedisConnectionState());
        }
        break;
      }
    }
  }
}
