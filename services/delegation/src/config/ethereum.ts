import { registerAs } from '@nestjs/config';

export default registerAs('ethereum', () => ({
  ethEndpoint: process.env.ETHEREUM_ENDPOINT,
  mainnetEndpoint: process.env.MAINNET_ENDPOINT,
  mainnetWallet: process.env.MAINNET_WALLET,
  testnetEndpoint: process.env.TESTNET_ENDPOINT,
  testnetWallet: process.env.TESTNET_WALLET,
  testnetFaucetWalletAddress:
    process.env.TESTNET_FAUCET_WALLET_ADDRESS ||
    '0xf4a52b8f6dc8ab046fec6ad02e77023c044342e4',
  testnetDelegationWallet: process.env.TESTNET_DELEGATION_WALLET,
  mainnetExplorerUrl: process.env.MAINNET_EXPLORER_URL,
  testnetExplorerUrl: process.env.TESTNET_EXPLORER_URL,
}));
