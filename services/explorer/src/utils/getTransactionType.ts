import { Transaction } from '../models';

export const getAddressTransactionType = (type: 0 | 1 | 2): string => {
  switch (type) {
    case 0:
      return 'Transfer';
    case 1:
      return 'Contract Call';
    case 2:
      return 'Contract Creation';
    default:
      return 'NA';
  }
};

export const getTransactionType = (transaction: Transaction): string => {
  if (!transaction) {
    return;
  }
  if (!transaction.to) {
    return 'Contract Creation';
  }

  if (transaction.inputData != '0x') {
    return 'Contract Call';
  }

  return 'Transfer';
};
