import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import IDPOS from "../artifacts/contracts/interfaces/IDPOS.sol/IDPOS.json";
dotenv.config();

async function main() {
  const txHash = "0xece7da811dad144df93f2b6a7824713062948131bcc11fb3967830aa004e8794";
  const receipt = await ethers.provider.getTransaction(txHash);
  console.log(receipt);

  const signer = new ethers.Wallet(process.env.MAINNET_PRIV_KEY || "", ethers.provider);
  console.log("signer address: ", signer.address);
  //   const dposProxy = new ethers.Contract("0x6c4dcdd09a2e54b24c170aae172ac1c344369a83", dposOrchestrator.abi);
  const dpos = new ethers.Contract("0x6c4dcdd09a2e54b24c170aae172ac1c344369a83", IDPOS.abi);
  const dposInterface = new ethers.utils.Interface(IDPOS.abi);
  const funcSignature =
    "getValidator(address) view returns (tuple(uint256 , uint256 , uint16 , uint64 , address , string , string ) )";
  const txData = dpos.interface.encodeFunctionData(funcSignature, ["0x18551e353aa65bc0ffbdf9d93b7ad4a8fe29cf95"]);
  const tx = {
    to: dpos.address,
    data: txData,
  };
  const txResult = await ethers.provider.send("eth_sendTransaction", [tx]);
  const decoded = dposInterface.decodeFunctionResult("getValidator", txResult);
  console.log("validator: ", decoded);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
