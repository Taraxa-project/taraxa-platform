import { registerAs } from '@nestjs/config';

export default registerAs('indexer', () => ({
  stakingUrl: process.env.STAKING_URL,
}));
