import { ValidatorStatus } from '@taraxa_project/taraxa-sdk';

export interface CommissionChangeGQL {
  validator: string;
  commission: number;
  applyAtBlock: number;
  registrationBlock: number;
  timestamp: number;
}

export const getValidatorStatusTooltip = (status: ValidatorStatus) => {
  switch (status) {
    case ValidatorStatus.ELIGIBLE:
      return 'Eligible';
    case ValidatorStatus.ELIGIBLE_INACTIVE:
      return 'Eligible but hasn`t produced blocks in the last 24 hours';
    case ValidatorStatus.NOT_ELIGIBLE:
      return 'Not eligible';
    default:
      return 'Not eligible';
  }
};
