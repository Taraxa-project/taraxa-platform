import { registerAs } from '@nestjs/config';

export default registerAs('ethereum', () => ({
  claimContractAddress: process.env.CLAIM_CONTRACT_ADDRESS,
  privateSigningKey: process.env.PRIVATE_SIGNING_KEY,
}));