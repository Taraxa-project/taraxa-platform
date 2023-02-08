import Bull from 'bull';

export enum QueueJobs {
  NEW_PBFT_BLOCKS = 'NEW_PBFT_BLOCKS',
  NEW_DAG_BLOCKS = 'NEW_DAG_BLOCKS',
  NEW_TRANSACTIONS = 'NEW_TRANSACTIONS',
}

export enum Queues {
  NEW_PBFTS = 'new_pbfts',
  NEW_DAGS = 'new_dags',
  STALE_TRANSACTIONS = 'stale_transactions',
}

export enum SyncTypes {
  LIVE = 'liveSync',
  HISTORICAL = 'historicalSync',
}
export interface QueueData {
  pbftPeriod: number;
  type: SyncTypes;
}

export interface TxQueueData {
  hash: string;
  type: SyncTypes;
}

export const JobKeepAliveConfiguration: Bull.JobOptions = {
  attempts: -1,
  removeOnComplete: {
    age: 60,
  },
  removeOnFail: {
    age: 86400,
  },
};
