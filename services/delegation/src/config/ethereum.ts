import { registerAs } from '@nestjs/config';

export default registerAs('ethereum', () => ({
  ethEndpoint: process.env.ETHEREUM_ENDPOINT,
  mainnetEndpoint: process.env.MAINNET_ENDPOINT,
  mainnetWallet: process.env.MAINNET_WALLLET,
}));
