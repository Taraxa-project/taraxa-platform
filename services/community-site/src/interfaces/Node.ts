import { ValidatorStatus } from './Validator';

export default interface Node {
  id: number;
  description: string;
  isActive: boolean;
  address: string;
  currentCommission: number | null;
  pendingCommission: number | null;
  hasPendingCommissionChange: boolean;
  weeklyRank: string | null;
  remainingDelegation: number;
  totalDelegation: number;
  yield: number;
  blocksProduced: number | null;
  weeklyBlocksProduced: string | null;
  lastBlockCreatedAt: string | null;
  firstBlockCreatedAt: string | null;
  status: ValidatorStatus;
}
