#!/usr/bin/env node
import * as fs from 'fs';

import { Contract, ContractInterface, ethers, utils } from 'ethers';
import DposAbi from './abi/DposAbi.json';
import * as dotenv from 'dotenv';
import { Delegation, Reward, Validator, ValidatorData } from './types';
dotenv.config();

const getContractInstance = async () => {
  const provider = new ethers.providers.WebSocketProvider(
    process.env.PROVIDER || ''
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
): Promise<{
  end: boolean;
  validators: Reward[];
}> => {
  const { dposContract, provider } = await getContractInstance();
  const res: {
    validators: ValidatorData[];
    end: boolean;
  } = await dposContract.getValidators(index, {
    blockTag: blockNumber,
  });
  const { hash, timestamp } = await provider.getBlock(blockNumber);
  const formattedValidators: Reward[] = await Promise.all(
    res.validators.map(async (validator: ValidatorData) => {
      // const allDelegations = await getAllDelegations(validator.account, blockNumber);
      return {
        blockNumber,
        blockTimestamp: timestamp,
        blockHash: hash,
        account: validator.account,
        commission: validator.info.commission,
        commissionReward: validator.info.commission_reward.toString(),
        // delegations: allDelegations
      };
    })
  );
  return {
    end: res.end,
    validators: formattedValidators,
  };
};

const getBlockValidators = async (block: number) => {
  let continueSearch = true;
  const allValidators: Validator[] = [];
  let index = 0;
  while (continueSearch) {
    const { end, validators } = await getAllValidators(index, block);
    allValidators.push(...validators);
    index++;
    continueSearch = !end;
  }
  return allValidators;
};

async function main() {
  const { currentBlock } = await getContractInstance();
  const blocks = [];
  for (let i = 1; i <= currentBlock; i++) {
    console.log('Current block: ', i);
    const validators = await getBlockValidators(i);
    blocks.push(...validators);
  }
  fs.writeFile(`src/output/blocks.json`, JSON.stringify(blocks), 'utf8', () => {
    console.log('File finished');
  });
  process.exit();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
