import React, { useEffect, useState } from 'react';

const blockData: any[] = Array(20).fill({
  txHash: '0x00e193a154...',
  status: 'SUCCESS',
  timestamp: 'string',
  pbftBlock: '529133',
  dagLevel: 'string',
  dagHash: 'string',
  value: '0.000000',
  from: '0xc26f6b31a5...',
  gasLimit: 'string',
  gas: '0.000021',
  gasPrice: 'string',
  to: '0xc3r17b31a5...',
  nonce: 153,
  transactionLink: <span>0x00e193a154...</span>,
  addressLinkFrom: <span>0xc26f6b31a5...</span>,
  addressLinkTo: <span>0xc3r17b31a5...</span>,
});

export const useAddressInfoEffects = () => {
  const [transactions, setTransactions] = useState<any[]>();

  useEffect(() => {
    setTransactions(blockData);
  }, []);

  return { transactions };
};
