import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { useExplorerLoader } from '../../hooks/useLoader';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import {
  ColumnData,
  PbftBlock,
  Transaction,
  TransactionTableData,
  TransactionTableRow,
} from '../../models';
import { blocksQueryWithTransactions } from '../../api';
import {
  formatTransactionStatus,
  fromWeiToTara,
  MIN_WEI_TO_CONVERT,
  toTransactionTableRow,
} from '../../utils';
import { useNodeStateContext } from '../../hooks';
import { ethers } from 'ethers';

export const displayThreshold =
  process.env.REACT_APP_DISPLAY_TXES_FOR_LAST_BLOCK || 25;
export const useTransactionEffects = (): {
  rows: { data: TransactionTableRow[] }[];
  columns: ColumnData[];
  currentNetwork: string;
} => {
  const [rows, setRows] = useState<{ data: TransactionTableRow[] }[]>([]);
  const { currentNetwork } = useExplorerNetwork();
  const [network] = useState(currentNetwork);
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
      const blocks = blockData.blocks as PbftBlock[];
      let txData: TransactionTableData[] = [];
      blocks.forEach((block) => {
        if (block) {
          const transactions = block.transactions;
          if (transactions?.length > 0) {
            const rows = transactions.map((tx: Transaction) => {
              return {
                timestamp: Number(block.timestamp),
                block: `${block.number}`,
                status: formatTransactionStatus(tx.status),
                txHash: tx.hash,
                value:
                  Number(tx.value) < MIN_WEI_TO_CONVERT
                    ? `${tx.value}`
                    : `${fromWeiToTara(ethers.BigNumber.from(tx.value))}`,
                token: Number(tx.value) < MIN_WEI_TO_CONVERT ? `Wei` : `TARA`,
              };
            });
            txData = [...txData, ...rows];
          }
        }
      });
      const rows = txData
        .sort((d1, d2) => (+d1.block < +d2.block ? 1 : -1))
        .map((row) => toTransactionTableRow(row));
      setRows(rows);
    }
  }, [blockData]);

  useEffect(() => {
    if (currentNetwork !== network) {
      setRows([]);
    }
  }, [currentNetwork, network]);

  return { rows, columns, currentNetwork };
};
