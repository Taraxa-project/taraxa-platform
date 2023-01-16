export enum QueueJobs {
  NEW_PBFT_BLOCKS = 'NEW_PBFT_BLOCKS',
  NEW_DAG_BLOCKS = 'NEW_DAG_BLOCKS',
  NEW_TRANSACTIONS = 'NEW_TRANSACTIONS',
}

export enum Queues {
  NEW_PBFTS = 'new_pbfts',
  NEW_DAGS = 'new_dags',
}

export enum SyncTypes {
  LIVE = 'liveSync',
  HISTORICAL = 'historicalSync',
}
export interface QueueData {
  pbftPeriod: number;
  type: SyncTypes;
}
