import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { ethers } from "ethers";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
      accounts:
        process.env.TEST_KEY_1 !== undefined
          ? [
              {
                privateKey: process.env.TEST_KEY_1!,
                balance: ethers.utils.parseEther("100000000000").toString(),
              },
              {
                privateKey: process.env.TEST_KEY_2!,
                balance: ethers.utils.parseEther("100000000000").toString(),
              },
              {
                privateKey: process.env.TEST_KEY_3!,
                balance: ethers.utils.parseEther("100000000000").toString(),
              },
              {
                privateKey: process.env.TEST_KEY_4!,
                balance: ethers.utils.parseEther("100000000000").toString(),
              },
              {
                privateKey: process.env.TEST_KEY_5!,
                balance: ethers.utils.parseEther("100000000000").toString(),
              },
            ]
          : [],
    },
    local: {
      url: "http://127.0.0.1:8545/",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    testnet: {
      chainId: 842,
      url: process.env.TARA_TESTNET_URL || "",
      accounts: process.env.MAINNET_PRIV_KEY !== undefined ? [process.env.MAINNET_PRIV_KEY] : [],
      gas: 2100000,
      gasPrice: 8000000000,
      gasMultiplier: 20,
      allowUnlimitedContractSize: true,
    },
    devnet: {
      chainId: 843,
      url: process.env.TARA_DEVNET_URL || "",
      accounts: process.env.MAINNET_PRIV_KEY !== undefined ? [process.env.MAINNET_PRIV_KEY] : [],
      gas: 2100000,
      gasPrice: 8000000000,
      gasMultiplier: 20,
      allowUnlimitedContractSize: true,
    },
    prnet: {
      chainId: 200,
      url: process.env.TARA_PRNET_URL || "",
      accounts: process.env.MAINNET_PRIV_KEY !== undefined ? [process.env.MAINNET_PRIV_KEY] : [],
      gas: 2100000,
      gasPrice: 8000000000,
      gasMultiplier: 20,
      allowUnlimitedContractSize: true,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  typechain: {
    outDir: "types",
  },
};

export default config;
