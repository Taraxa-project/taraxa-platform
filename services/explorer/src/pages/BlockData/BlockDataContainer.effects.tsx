import { useCallback, useEffect, useState } from 'react';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { BlockDetails, TransactionStatus } from '../../models/TableData';
import { TransactionData } from '../../models/TransactionData';

export const useBlockDataContainerEffects = (txHash: string) => {
  const { currentNetwork } = useExplorerNetwork();
  const [blockData, setBlockData] = useState<BlockDetails>({} as BlockDetails);
  const [transactions, setTransactions] = useState<TransactionData[]>([
    {} as TransactionData,
  ]);

  const onClickTransactions = useCallback(() => {
    const click = async () => {
      console.log('click click click');
    };
    click();
  }, []);

  const fetchBlockDetails = useCallback(() => {
    setTimeout(() => {
      const blockDetails: BlockDetails = {
        timestamp: '1661858931',
        block: '529133',
        hash: txHash,
        transactionCount: 72,
        period: '11923',
        pivot:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        sender: '0xc6a808A6EC3103548f0b38d32DCb6a705B700ACDE',
        signature:
          '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea180x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
        verifiableDelay: 443,
      };
      setBlockData(blockDetails);
    }, 500);
  }, []);

  const fetchTransactions = useCallback(() => {
    setTimeout(() => {
      const transactions: TransactionData[] = [
        {
          txHash:
            '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          status: TransactionStatus.SUCCESS,
          timestamp: '1661776098',
          pbftBlock: txHash,
          dagLevel: '529133',
          dagHash:
            '0x00ACD3a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          value: '1000000',
          from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          gasLimit: '210000',
          gas: '21000',
          gasPrice: '3100',
          nonce: 244411,
        },
        {
          txHash:
            '0x11e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          status: TransactionStatus.SUCCESS,
          timestamp: '1661776098',
          pbftBlock:
            '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          dagLevel: '529133',
          dagHash: txHash,
          value: '1000000',
          from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          gasLimit: '210000',
          gas: '21000',
          gasPrice: '3100',
          nonce: 244411,
        },
        {
          txHash:
            '0x44e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          status: TransactionStatus.SUCCESS,
          timestamp: '1661776098',
          pbftBlock: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
          dagLevel: '529133',
          dagHash: txHash,
          value: '1000000',
          from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          gasLimit: '210000',
          gas: '21000',
          gasPrice: '3100',
          nonce: 244411,
        },
        {
          txHash:
            '0x55e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          status: TransactionStatus.FAILURE,
          timestamp: '1661776098',
          pbftBlock: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
          dagLevel: '529133',
          dagHash:
            '0x00ACD3a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          value: '1000000',
          from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          gasLimit: '210000',
          gas: '21000',
          gasPrice: '3100',
          nonce: 244411,
        },
        {
          txHash:
            '0x99e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          status: TransactionStatus.SUCCESS,
          timestamp: '1661776098',
          pbftBlock: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
          dagLevel: '529133',
          dagHash:
            '0x00ACD3a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          value: '1000000',
          from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          gasLimit: '210000',
          gas: '21000',
          gasPrice: '3100',
          nonce: 244411,
        },
        {
          txHash:
            '0x99e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          status: TransactionStatus.SUCCESS,
          timestamp: '1661776098',
          pbftBlock: '0xc26f6b31a5f8452201af8db5cc25cf4340df8b09',
          dagLevel: '529133',
          dagHash:
            '0x00ACD3a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          value: '1000000',
          from: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          to: '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18',
          gasLimit: '210000',
          gas: '21000',
          gasPrice: '3100',
          nonce: 244411,
        },
      ];
      setTransactions(transactions);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchBlockDetails();
  }, [currentNetwork]);

  useEffect(() => {
    fetchTransactions();
  }, [blockData]);

  return { blockData, transactions, currentNetwork, onClickTransactions };
};
