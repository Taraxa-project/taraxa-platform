import { BigNumber, ethers } from 'ethers';
import moment from 'moment';

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
  numberOfTokens: BigNumber;
  totalClaimed?: BigNumber;
  claimed: boolean;
  claimedAt: Date | null;
  createdAt: Date;
}
function useRedeem() {
  const parseClaim = (claimData: ClaimResponse): Claim => ({
    id: claimData.id,
    address: claimData.address,
    numberOfTokens: BigNumber.from(ethers.utils.parseUnits(claimData.numberOfTokens, 18)),
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
        numberOfTokens: BigNumber.from(ethers.utils.parseUnits(claim.numberOfTokens, 18)),
        claimedAt: moment(claim.claimedAt).toDate(),
        createdAt: moment(claim.createdAt).toDate(),
        claimed: claim.claimed,
        totalClaimed: BigNumber.from('0'),
      } as Claim;
    });
    transformedClaims.sort(
      (claimA, claimB) => claimA.createdAt.getTime() - claimB.createdAt.getTime(),
    );
    const finalClaims = transformedClaims.map((_claim, ind) => {
      const prevElement = ind > 0 ? transformedClaims[ind - 1] : undefined;
      if (prevElement && prevElement.totalClaimed) {
        _claim.totalClaimed = prevElement.totalClaimed.add(_claim.numberOfTokens);
      } else {
        _claim.totalClaimed = _claim.numberOfTokens;
      }
      return _claim;
    });
    const reversedClaims = finalClaims.reverse();
    reversedClaims.unshift({
      id: 999,
      address: account || '',
      numberOfTokens:
        finalClaims[0] && finalClaims[0].totalClaimed
          ? availableToBeClaimed.sub(finalClaims[0].totalClaimed)
          : availableToBeClaimed,
      totalClaimed: finalClaims[0] ? finalClaims[0].totalClaimed : BigNumber.from('0'),
      claimed: false,
      claimedAt: null,
      createdAt: new Date(),
    });
    return finalClaims;
  };

  return { parseClaim, formatClaimsForTable };
}

export default useRedeem;
