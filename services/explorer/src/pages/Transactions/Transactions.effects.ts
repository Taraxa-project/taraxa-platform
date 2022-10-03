import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { useExplorerLoader } from '../../hooks/useLoader';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { ColumnData, Transaction, TransactionTableData } from '../../models';
import { blockQuery } from '../../api';
import { formatTransactionStatus } from '../../utils';

export const useTransactionEffects = () => {
  const [data, setData] = useState<TransactionTableData[]>();
  const { currentNetwork } = useExplorerNetwork();
  const { initLoading, finishLoading } = useExplorerLoader();
  const [{ fetching, data: blockData }] = useQuery({
    query: blockQuery,
  });

  const columns: ColumnData[] = [
    { path: 'timestamp', name: 'Timestamp' },
    { path: 'block', name: 'Block' },
    { path: 'status', name: 'Status' },
    { path: 'txHash', name: 'TxHash' },
    { path: 'value', name: 'Value' },
  ];

  useEffect(() => {
    if (fetching) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [fetching]);

  useEffect(() => {
    if (blockData?.block) {
      const transactions = blockData?.block?.transactions;
      if (transactions?.length) {
        const rows = transactions.map((transaction: Transaction) => {
          return {
            timestamp: blockData?.block?.timestamp,
            block: blockData?.block?.number,
            status: formatTransactionStatus(transaction.status),
            txHash: transaction.hash,
            value: transaction.value,
            token: 'TARA',
          };
        });
        setData(rows);
      }
    }
  }, [blockData]);

  return { data, columns, currentNetwork };
};
