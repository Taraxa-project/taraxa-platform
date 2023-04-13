import { ValidatorStatus } from '../interfaces/Validator';

export const getValidatorStatusTooltip = (status: ValidatorStatus) => {
  switch (status) {
    case ValidatorStatus.Green:
      return 'Eligible';
    case ValidatorStatus.Yellow:
      return 'Eligible but hasn`t produced blocks in the last 24 hours';
    case ValidatorStatus.Grey:
      return 'Not eligible';
    default:
      return 'Not eligible';
  }
};
