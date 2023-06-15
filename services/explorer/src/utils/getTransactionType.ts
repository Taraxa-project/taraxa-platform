import { Transaction } from '../models';

export enum TransactionType {
  Transfer = 'Transfer',
  Contract_Call = 'Contract Call',
  Contract_Creation = 'Contract Creation',
  Internal_Transfer = 'Internal Transfer',
  Internal_Contract_Call = 'Internal Contract Call',
  Internal_Contract_Creation = 'Internal Contract Creation',
}

export const getAddressTransactionType = (
  type: 0 | 1 | 2 | 3 | 4 | 5
): string => {
  switch (type) {
    case 0:
      return TransactionType.Transfer;
    case 1:
      return TransactionType.Contract_Call;
    case 2:
      return TransactionType.Contract_Creation;
    case 3:
      return TransactionType.Internal_Transfer;
    case 4:
      return TransactionType.Internal_Contract_Call;
    case 5:
      return TransactionType.Internal_Contract_Creation;
    default:
      return 'NA';
  }
};

export const getTransactionType = (transaction: Transaction): string => {
  if (!transaction) {
    return;
  }
  if (!transaction.to) {
    return TransactionType.Contract_Creation;
  }

  if (transaction.inputData != '0x') {
    return TransactionType.Contract_Call;
  }

  return TransactionType.Transfer;
};
