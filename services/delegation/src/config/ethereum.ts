import { registerAs } from "@nestjs/config";

export default registerAs("ethereum", () => ({
  ethEndpoint: process.env.ETHEREUM_ENDPOINT,
  mainnetEndpoint: process.env.MAINNET_ENDPOINT,
  mainnetWallet: process.env.MAINNET_WALLET,
  testnetEndpoint: process.env.TESTNET_ENDPOINT,
  testnetWallet: process.env.TESTNET_WALLET,
  mainnetExplorerUrl: process.env.MAINNET_EXPLORER_URL,
  testnetExplorerUrl: process.env.TESTNET_EXPLORER_URL,
}));
