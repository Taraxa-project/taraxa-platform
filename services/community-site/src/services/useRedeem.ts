import { ethers } from 'ethers';
import moment from 'moment';
import { formatEth, roundEth, weiToEth } from '../utils/eth';

export interface ClaimData {
  availableToBeClaimed: string;
  nonce: number;
  hash: string;
}
export interface ClaimResponse {
  id: number;
  address: string;
  numberOfTokens: string;
  claimed: boolean;
  claimedAt: string;
  createdAt: string;
}

export interface Claim {
  id: number;
  address: string;
  numberOfTokens: string;
  totalClaimed?: string;
  claimed: boolean;
  claimedAt: Date;
  createdAt: Date;
}
function useRedeem() {
  const parseClaim = (claimData: ClaimResponse): Claim => ({
    id: claimData.id,
    address: claimData.address,
    numberOfTokens: claimData.numberOfTokens,
    claimedAt: moment(claimData.claimedAt).toDate(),
    createdAt: moment(claimData.createdAt).toDate(),
    claimed: claimData.claimed,
  });

  const formatClaimsForTable = (
    claimsIncoming: ClaimResponse[],
    account: string,
    availableToBeClaimed: ethers.BigNumber,
  ) => {
    const transformedClaims = claimsIncoming.map((claim: ClaimResponse) => {
      return {
        id: claim.id,
        address: claim.address,
        numberOfTokens: claim.numberOfTokens,
        claimedAt: moment(claim.claimedAt).toDate(),
        createdAt: moment(claim.createdAt).toDate(),
        claimed: claim.claimed,
        totalClaimed: '0',
      } as Claim;
    });
    transformedClaims.sort(
      (claimA, claimB) => claimA.createdAt.getTime() - claimB.createdAt.getTime(),
    );
    const finalClaims = transformedClaims.map((_claim, ind) => {
      const prevElement = ind > 0 ? transformedClaims[ind - 1] : undefined;
      if (prevElement && prevElement.totalClaimed) {
        const newClaimed = _claim.claimed
          ? +prevElement.totalClaimed + +_claim.numberOfTokens
          : +prevElement.totalClaimed;
        _claim.totalClaimed = `${newClaimed}`;
      } else {
        _claim.totalClaimed = `${_claim.claimed ? _claim.numberOfTokens : '0'}`;
      }
      return _claim;
    });
    finalClaims.reverse();
    finalClaims.unshift({
      id: 999,
      address: account || '',
      numberOfTokens: formatEth(roundEth(weiToEth(availableToBeClaimed.toString()))),
      totalClaimed: finalClaims[0].totalClaimed,
      claimed: false,
      claimedAt: new Date(),
      createdAt: new Date(),
    });
    return finalClaims;
  };

  return { parseClaim, formatClaimsForTable };
}

export default useRedeem;
