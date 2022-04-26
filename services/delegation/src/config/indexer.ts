import { registerAs } from '@nestjs/config';

export default registerAs('indexer', () => ({
  stakingUrl: process.env.INDEXER_STAKING_URL,
}));
