import { registerAs } from '@nestjs/config';

export default registerAs('delegation', () => ({
  yield: 20,
  coolingOffPeriodDays: 5,
  commissionChangeThreshold: 5,
  minDelegation: 1000,
  maxDelegation: 10000000,
  testnetDelegation: 100000,
}));
