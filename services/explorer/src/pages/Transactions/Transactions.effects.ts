import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { useExplorerLoader } from '../../hooks/useLoader';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import {
  ColumnData,
  PbftBlock,
  Transaction,
  TransactionTableData,
} from '../../models';
import { blocksQueryWithTransactions } from '../../api';
import { formatTransactionStatus } from '../../utils';
import { useNodeStateContext } from '../../hooks';

export const displayThreshold = process.env.DISPLAY_TXES_FOR_LAST_BLOCK || 25;
export const useTransactionEffects = (): {
  data: TransactionTableData[];
  columns: ColumnData[];
  currentNetwork: string;
} => {
  const [data, setData] = useState<TransactionTableData[]>();
  const { currentNetwork } = useExplorerNetwork();
  const { finalBlock } = useNodeStateContext();
  const { initLoading, finishLoading } = useExplorerLoader();
  const [{ fetching, data: blockData }] = useQuery({
    query: blocksQueryWithTransactions,
    variables: {
      from: finalBlock ? finalBlock - Number(displayThreshold) : 0,
      to: finalBlock || 0,
    },
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
    if (blockData?.blocks) {
      const blocks = blockData?.blocks as PbftBlock[];
      blocks.forEach((block) => {
        if (block) {
          const transactions = block?.transactions;
          if (transactions?.length) {
            const rows = transactions.map((transaction: Transaction) => {
              return {
                timestamp: Number(block?.timestamp),
                block: `${block?.number}`,
                status: formatTransactionStatus(transaction.status),
                txHash: transaction.hash,
                value: `${transaction.value}`,
                token: 'TARA',
              };
            });
            setData(rows);
          }
        }
      });
    }
  }, [blockData]);

  useEffect(() => {
    setData([]);
  }, [currentNetwork]);

  return { data, columns, currentNetwork };
};
