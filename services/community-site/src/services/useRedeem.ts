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
        claimedAt: claim.claimedAt ? moment(claim.claimedAt).toDate() : null,
        createdAt: moment(claim.createdAt).toDate(),
        claimed: claim.claimed,
      } as Claim;
    });
    transformedClaims.sort(
      (claimA, claimB) => claimA.createdAt.getTime() - claimB.createdAt.getTime(),
    );
    transformedClaims.reverse();
    const totalUnclaimed = transformedClaims
      .map((c) => {
        if (!c.claimed && c.numberOfTokens.gt('0')) {
          return c.numberOfTokens;
        }
        return BigNumber.from('0');
      })
      .reduce((a, b) => a.add(b), BigNumber.from('0'));

    if (availableToBeClaimed.lte(totalUnclaimed)) return transformedClaims;

    transformedClaims.unshift({
      id: 999,
      address: account || '',
      numberOfTokens:
        totalUnclaimed.gt(0) && availableToBeClaimed.gt(totalUnclaimed)
          ? availableToBeClaimed.sub(totalUnclaimed)
          : availableToBeClaimed,
      claimed: false,
      claimedAt: null,
      createdAt: new Date(),
    });

    return transformedClaims;
  };

  return { parseClaim, formatClaimsForTable };
}

export default useRedeem;
