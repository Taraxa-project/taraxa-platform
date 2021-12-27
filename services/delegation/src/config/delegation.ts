import { registerAs } from '@nestjs/config';

export default registerAs('delegation', () => ({
  coolingOffPeriodDays: 5,
  minDelegation: 1000,
  maxDelegation: 10000000,
}));
