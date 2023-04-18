import { ValidatorWithStats } from '../interfaces/Validator';

const calculateValidatorYield = (validators: ValidatorWithStats[]): ValidatorWithStats[] => {
  if (!validators.length) {
    return validators;
  }
  const validatorsWithStake = validators.map((v) => {
    return {
      ...v,
      blocksPerStake: v.pbftsProduced / Number.parseFloat(v.delegation.toString()),
    };
  });
  const minBlockRatio = validatorsWithStake.reduce((prev, curr) =>
    prev.blocksPerStake < curr.blocksPerStake ? prev : curr,
  );

  const maxBlockRatio = validatorsWithStake.reduce((prev, curr) =>
    prev.blocksPerStake > curr.blocksPerStake ? prev : curr,
  );
  return validatorsWithStake.map((validator) => {
    const yieldRatio =
      ((parseFloat(validator.blocksPerStake.toString()) - minBlockRatio.blocksPerStake) /
        (parseFloat(maxBlockRatio.blocksPerStake.toString()) -
          parseFloat(minBlockRatio.blocksPerStake.toString()))) *
      20;
    return {
      ...validator,
      yield: yieldRatio,
    } as ValidatorWithStats;
  });
};
export default calculateValidatorYield;
