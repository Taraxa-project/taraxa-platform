export default interface Node {
  id: number;
  name: string;
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
  lastBlockCreatedAt: number | null;
}
