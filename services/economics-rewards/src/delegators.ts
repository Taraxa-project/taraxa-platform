import { DelegationData, Delegator } from './types';
import { getContractInstance } from './contract';
import { saveDelegator } from './database';

const getAndPersistDelegations = async (
  delegator: string,
  blockNumber: number,
  index: number
) => {
  const { dposContract, provider } = await getContractInstance();
  const { hash, timestamp } = await provider.getBlock(blockNumber);

  const res: {
    delegations: DelegationData[];
    end: boolean;
  } = await dposContract.getDelegations(delegator, index, {
    blockTag: blockNumber,
  });
  const formattedDelegations: Delegator[] = await Promise.all(
    res.delegations.map(async (delegationData: DelegationData) => {
      const formatted = {
        blockNumber: blockNumber,
        blockTimestamp: timestamp,
        blockHash: hash,
        delegator: delegator,
        validator: delegationData.account,
        stake: delegationData?.delegation?.stake?.toString(),
        rewards: delegationData?.delegation?.rewards?.toString(),
      };
      await saveDelegator(formatted);
      return formatted;
    })
  );
  return {
    end: res.end,
    delegations: formattedDelegations,
  };
};

const getAllDelegations = async (
  validator: string,
  blockNumber: number
): Promise<Delegator[]> => {
  let continueSearch = true;
  const allDelegations: Delegator[] = [];
  let index = 0;
  while (continueSearch) {
    const { end, delegations } = await getAndPersistDelegations(
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

const getAllDelegatorsAddresses = async (blockNumber: number) => {
  const { dposContract } = await getContractInstance();

  let continueSearch = true;
  const allDelegators: any = [];
  let index = 0;
  while (continueSearch) {
    const { end, delegators } = await dposContract.getDelegatorsAddresses(
      index,
      {
        blockTag: blockNumber,
      }
    );
    allDelegators.push(...delegators);
    index++;
    continueSearch = !end;
  }
  return allDelegators;
};

export const getBlockDelegators = async (blockNumber: number) => {
  const delegatorAddresses = await getAllDelegatorsAddresses(blockNumber);
  if (delegatorAddresses?.length > 0) {
    delegatorAddresses.forEach(async (address: string) => {
      await getAllDelegations(address, blockNumber);
    });
  }
};
