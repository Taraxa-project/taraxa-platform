import { Validator, ValidatorData } from './types';
import { saveValidator } from './database';
import { getContractInstance } from './contract';

const getAllValidators = async (
  index: number,
  blockNumber: number
): Promise<{ end: boolean; validators: Validator[] }> => {
  const { dposContract, provider } = await getContractInstance();
  const { hash, timestamp } = await provider.getBlock(blockNumber);

  const res: {
    validators: ValidatorData[];
    end: boolean;
  } = await dposContract.getValidators(index, {
    blockTag: blockNumber,
  });

  const formattedValidators: Validator[] = await Promise.all(
    res.validators.map(async (validator: ValidatorData) => {
      const formatted = {
        blockNumber: blockNumber,
        blockTimestamp: timestamp,
        blockHash: hash,
        account: validator.account,
        commission: validator.info.commission.toString(),
        commissionReward: validator.info.commission_reward.toString(),
      };
      await saveValidator(formatted);
      return formatted;
    })
  );
  return {
    end: res.end,
    validators: formattedValidators,
  };
};

export const getBlockValidators = async (blockNumber: number) => {
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
