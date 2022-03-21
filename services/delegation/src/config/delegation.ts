import { ethers } from 'ethers';
import { registerAs } from '@nestjs/config';

export default registerAs('delegation', () => ({
  yield: 20,
  coolingOffPeriodDays: 5,
  commissionChangeThreshold: 5,
  minDelegation: 1000,
  maxDelegation: 10000000,
  testnetDelegation: ethers.BigNumber.from(1000000).mul(
    ethers.BigNumber.from(10).pow(18),
  ),
  mainnetDelegation: ethers.BigNumber.from(10).pow(18),
}));
