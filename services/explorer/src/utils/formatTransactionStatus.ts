import { TransactionStatus } from '../models';

export const formatTransactionStatus = (
  status: number | null
): TransactionStatus => {
  switch (status) {
    case 1:
      return TransactionStatus.SUCCESS;
    case 0:
      return TransactionStatus.FAILURE;
    case null:
      return TransactionStatus.IN_PROGRESS;
    default:
      return TransactionStatus.IN_PROGRESS;
  }
};
