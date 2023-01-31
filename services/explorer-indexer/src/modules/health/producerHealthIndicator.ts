import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import DagService from '../dag/dag.service';
import LiveSyncerService from '../live-sync/live.syncer.service';
import PbftService from '../pbft/pbft.service';
import TransactionService from '../transaction/transaction.service';

@Injectable()
export class ProducerHealthIndicator extends HealthIndicator {
  constructor(
    private readonly pbftService: PbftService,
    private readonly dagService: DagService,
    private readonly txService: TransactionService,
    private readonly liveSyncService: LiveSyncerService
  ) {
    super();
  }

  async isHealthy(
    key:
      | 'pbft'
      | 'dag'
      | 'queue_pbfts'
      | 'queue_dags'
      | 'queue_transactions'
      | 'ws'
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
      case 'queue_transactions': {
        if (this.txService) {
          return this.getStatus(key, this.txService.getRedisConnectionState());
        }
        break;
      }
      case 'ws': {
        if (this.liveSyncService) {
          return this.getStatus(key, this.liveSyncService.getWsState());
        }
      }
    }
  }
}
