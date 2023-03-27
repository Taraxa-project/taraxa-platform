import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const validators: string[] = [];
  const dposAddress = process.env.DPOS_ADDRESS;
  const signer = new ethers.Wallet(process.env.MAINNET_PRIV_KEY || "", ethers.provider);
  console.log("signer address: ", signer.address);

  const Delegation = await ethers.getContractFactory("Delegation");
  const delegation = await Delegation.connect(signer).deploy(validators, dposAddress);

  await delegation.deployed();

  console.log("Delegation deployed to:", delegation.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
