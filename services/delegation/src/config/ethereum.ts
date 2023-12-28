import { registerAs } from '@nestjs/config';

export default registerAs('ethereum', () => ({
  ethEndpoint: process.env.ETHEREUM_ENDPOINT,
  mainnetEndpoint: process.env.MAINNET_ENDPOINT,
  mainnetWallet: process.env.MAINNET_WALLET,
  testnetEndpoint: process.env.TESTNET_ENDPOINT,
  testnetWallet: process.env.TESTNET_WALLET,
  mainnetIndexerUrl: process.env.MAINNET_INDEXER_URL,
  testnetIndexerUrl: process.env.TESTNET_INDEXER_URL,
  dposProxyAddress: process.env.DPOS_PROXY_ADDRESS,
}));
