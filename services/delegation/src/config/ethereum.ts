import { registerAs } from '@nestjs/config';

export default registerAs('ethereum', () => ({
  endpoint: process.env.ETHEREUM_ENDPOINT,
}));
