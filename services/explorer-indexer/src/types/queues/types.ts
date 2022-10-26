export enum QueueJobs {
  NEW_PBFT_BLOCKS = 'NEW_PBFT_BLOCKS',
  NEW_DAG_BLOCKS = 'NEW_DAG_BLOCKS',
  NEW_TRANSACTIONS = 'NEW_TRANSACTIONS',
}

export interface DagQueueData {
  pbftPeriod: number;
}
