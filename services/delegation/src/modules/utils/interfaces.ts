export interface NodeStatsReponse {
  dagsCount: number;
  pbftCount: number;
  transactionsCount: number;
  lastDagTimestamp: number;
  lastPbftTimestamp: number;
}

export interface AddressDetailsResponse {
  address: string;
  pbftCount: number;
  rank: number;
}
