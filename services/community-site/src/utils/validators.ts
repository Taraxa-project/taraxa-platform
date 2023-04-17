import { Validator, ValidatorWithStats, YieldedValidator } from '../interfaces/Validator';

const calulcateValidatorYield = (validators: Validator[]): ValidatorWithStats[] | Validator[] => {
  const hasStats = (validators[0] as ValidatorWithStats)?.pbftsProduced !== 0;
  if (!hasStats) {
    return validators;
  }
  const validatorsWithStats = validators as ValidatorWithStats[];
  const validatorsWithStake: YieldedValidator[] = validatorsWithStats.map((v) => {
    return {
      ...v,
      blocksPerStake: v.pbftsProduced || 0 / Number.parseFloat(v.delegation.toString()),
    };
  });
  const minBlockRatio = validatorsWithStake.reduce((prev, curr) =>
    prev.blocksPerStake! < curr.blocksPerStake! ? prev : curr,
  );

  const maxBlockRatio = validatorsWithStake.reduce((prev, curr) =>
    prev.blocksPerStake! > curr.blocksPerStake! ? prev : curr,
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
export default calulcateValidatorYield;
