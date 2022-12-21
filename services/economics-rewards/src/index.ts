#!/usr/bin/env node
import { Contract, ContractInterface, ethers, utils } from 'ethers';
import DposAbi from './abi/DposAbi.json';
import * as dotenv from 'dotenv';
import { Delegation, Reward, Validator, ValidatorData } from './types';
import {
  fetchLatestBlockNumber,
  initializeConnection,
  saveReward,
} from './database';
dotenv.config();

const getContractInstance = async () => {
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

const getDelegations = async (
  validator: string,
  blockNumber: number,
  index: number
) => {
  const { dposContract } = await getContractInstance();
  const res: {
    delegations: Delegation[];
    end: boolean;
  } = await dposContract.getDelegations(validator, index, {
    blockTag: blockNumber,
  });
  const formattedDelegations: Delegation[] = res.delegations.map(
    (delegation: Delegation) => {
      return {
        account: delegation.account,
        delegation: delegation.delegation,
      };
    }
  );
  return {
    end: res.end,
    delegations: formattedDelegations,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllDelegations = async (
  validator: string,
  blockNumber: number
): Promise<Delegation[]> => {
  let continueSearch = true;
  const allDelegations: Delegation[] = [];
  let index = 0;
  while (continueSearch) {
    const { end, delegations } = await getDelegations(
      validator,
      blockNumber,
      index
    );
    allDelegations.push(...delegations);
    index++;
    continueSearch = !end;
  }
  return allDelegations;
};

const getAllValidators = async (
  index: number,
  blockNumber: number
): Promise<{ end: boolean; validators: Reward[] }> => {
  const { dposContract, provider } = await getContractInstance();
  const { hash, timestamp } = await provider.getBlock(blockNumber);

  const res: {
    validators: ValidatorData[];
    end: boolean;
  } = await dposContract.getValidators(index, {
    blockTag: blockNumber,
  });

  const formattedValidators: Reward[] = await Promise.all(
    res.validators.map(async (validator: ValidatorData) => {
      // const allDelegations = await getAllDelegations(validator.account, blockNumber);
      const formatted = {
        blockNumber: blockNumber,
        blockTimestamp: timestamp,
        blockHash: hash,
        account: validator.account,
        commission: validator.info.commission.toString(),
        commissionReward: validator.info.commission_reward.toString(),
        // delegations: allDelegations
      };
      await saveReward(formatted);
      return formatted;
    })
  );
  return {
    end: res.end,
    validators: formattedValidators,
  };
};

const getBlockValidators = async (blockNumber: number) => {
  let continueSearch = true;
  const allValidators: Validator[] = [];
  let index = 0;
  while (continueSearch) {
    const { end, validators } = await getAllValidators(index, blockNumber);
    allValidators.push(...validators);
    index++;
    continueSearch = !end;
  }
  return allValidators;
};

async function main() {
  initializeConnection();
  const { currentBlock } = await getContractInstance();
  const latestBlock = await fetchLatestBlockNumber();
  console.log('Final Block is: ', currentBlock);
  console.log('Latest block is: ', latestBlock);
  const blocks = [];
  const startBlock = latestBlock ? latestBlock + 1 : 1;
  console.log('Start block os: ', startBlock);
  for (let i = startBlock; i <= currentBlock; i++) {
    console.log('Current block: ', i);
    const validators = await getBlockValidators(i);
    blocks.push(...validators);
  }
  // process.exit();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
