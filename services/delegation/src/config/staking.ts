import { registerAs } from '@nestjs/config';

export default registerAs('staking', () => ({
  contract: process.env.STAKING_CONTRACT_ADDRESS,
}));
