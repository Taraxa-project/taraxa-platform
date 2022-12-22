import * as dotenv from 'dotenv';
import { Contract, ContractInterface, ethers, utils } from 'ethers';
import DposAbi from './abi/DposAbi.json';
dotenv.config();

export const getContractInstance = async () => {
  if (!process.env.PROVIDER) {
    throw new Error('Provider missing! Please add it to the .env file');
  }
  const provider = new ethers.providers.WebSocketProvider(
    `${process.env.PROVIDER}`
  );
  const signer = provider.getSigner();
  const contractAddress = process.env.DPOS_CONTRACT_ADDRESS || '';
  const dposContract = new Contract(
    contractAddress,
    new utils.Interface(DposAbi) as ContractInterface,
    provider
  );
  const currentBlock = await provider.getBlockNumber();
  return {
    provider,
    signer,
    dposContract,
    currentBlock,
  };
};
