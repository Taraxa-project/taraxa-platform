import { IGQLTransaction } from './GQLTransaction';

export interface IGQLDag {
  hash: string;
  pivot?: string;
  tips?: string[];
  level?: number;
  pbftPeriod?: number;
  timestamp: number;
  author?: {
    address: string;
  };
  signature?: string;
  vdf?: number;
  transactionCount?: number;
  transactions?: IGQLTransaction[];
}
