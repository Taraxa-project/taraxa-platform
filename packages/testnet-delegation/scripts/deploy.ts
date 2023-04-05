import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const validators: string[] = [];
  const signer = new ethers.Wallet(process.env.MAINNET_PRIV_KEY || "", ethers.provider);
  console.log("signer address: ", signer.address);

  const DelegationOrchestrator = await ethers.getContractFactory("DelegationOrchestrator");
  const delegationOrchestrator = await DelegationOrchestrator.connect(signer).deploy(validators);

  await delegationOrchestrator.deployed();

  console.log("Delegation deployed to:", delegationOrchestrator.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
