import { BigNumber } from 'ethers';
import { Validator, ValidatorStatus, ValidatorType } from './Validator';

export interface Node {
  id: number;
  description: string;
  isActive: boolean;
  address: string;
  user: number;
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
  ip: string;
}

export const nodeToValidator = (node: Node): Validator => ({
  address: node.address,
  owner: `${node.user}`,
  commission: node.currentCommission || 0,
  commissionReward: BigNumber.from(0),
  lastCommissionChange: 0,
  delegation: BigNumber.from(node.totalDelegation),
  availableForDelegation: BigNumber.from(node.remainingDelegation),
  description: node.description,
  endpoint: node.ip,
  isFullyDelegated: node.remainingDelegation === node.totalDelegation,
  isActive: node.isActive,
  status: ValidatorStatus.NOT_ELIGIBLE,
  rank: Number(node.weeklyRank || 0),
  pbftsProduced: node.blocksProduced || 0,
  yield: node.yield || 0,
  type: ValidatorType.TESTNET,
});
