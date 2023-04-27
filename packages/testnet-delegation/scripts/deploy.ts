import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const validators: string[] = [
    "0x18551e353aa65bc0ffbdf9d93b7ad4a8fe29cf95",
    "0xc578bb5fc3dac3e96a8c4cb126c71d2dc9082817",
    "0x5c9afb23fba3967ca6102fb60c9949f6a38cd9e8",
    "0x403480c2b2ade0851c62bd1ff7a594c416aff7ce",
    "0x5042fa2711fe547e46c2f64852fdaa5982c80697",
    "0x6258d8f51ea17e873f69a2a978fe311fd95743dd",
  ];
  const signer = new ethers.Wallet(process.env.MAINNET_PRIV_KEY || "", ethers.provider);
  console.log("signer address: ", signer.address);

  const DelegationOrchestrator = await ethers.getContractFactory("DelegationOrchestrator");
  const MockDpos = await ethers.getContractFactory("MockDpos");
  const mockDpos = await MockDpos.connect(signer).deploy(validators);
  await mockDpos.deployed();
  const delegationOrchestrator = await DelegationOrchestrator.connect(signer).deploy(validators, mockDpos.address, {
    value: ethers.utils.parseEther("100000"),
  });

  await delegationOrchestrator.deployed();

  console.log("Delegation deployed to:", delegationOrchestrator.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
