import { ethers } from 'ethers';
import { registerAs } from '@nestjs/config';

export default registerAs('delegation', () => {
  return {
    yield: 20,
    commissionChangeThreshold: 5,
    minDelegation: ethers.BigNumber.from(1000).mul(
      ethers.BigNumber.from(10).pow(18),
    ),
    maxDelegation: 80000000,
    eligibilityThreshold: 1000000,
    testnetDelegation: ethers.BigNumber.from(500000).mul(
      ethers.BigNumber.from(10).pow(18),
    ),
    mainnetDelegation: ethers.BigNumber.from(10).pow(18), // not sure why this is here
    undelegationConfirmationDelay: Number(
      process.env.NR_BLOCKS_UNDELEGATION_DELAY || 5,
    ),
  };
});
