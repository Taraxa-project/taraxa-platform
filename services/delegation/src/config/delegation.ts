import { ethers } from 'ethers';
import { registerAs } from '@nestjs/config';

export default registerAs('delegation', () => {
  let ownNodes = [];

  if (process.env.TESTNET_OWN_NODES !== '') {
    try {
      ownNodes = JSON.parse(process.env.TESTNET_OWN_NODES);
    } catch (e) {
      ownNodes = [];
      console.error(
        `Could not parse own nodes JSON`,
        process.env.TESTNET_OWN_NODES,
      );
    }
  }

  return {
    yield: 20,
    commissionChangeThreshold: 5,
    minDelegation: ethers.BigNumber.from(1000).mul(
      ethers.BigNumber.from(10).pow(18),
    ),
    maxDelegation: 80000000,
    eligibilityThreshold: 1000000,
    testnetDelegation: ethers.BigNumber.from(1000000).mul(
      ethers.BigNumber.from(10).pow(18),
    ),
    mainnetDelegation: ethers.BigNumber.from(10).pow(18),
    testnetOwnNodes: ownNodes,
    undelegationConfirmationDelay: Number(
      process.env.NR_BLOCKS_UNDELEGATION_DELAY || 5,
    ),
  };
});
