import axios from 'axios';
import { ethers } from 'ethers';
import { displayWeiOrTara, getAddressTransactionType } from '../../utils';
import {
  FetchWithPagination,
  AddressTxResponse,
  ResultWithPagination,
} from '../types';

export const useGetTransactionsByAddress = (
  address: string
): ((
  endpoint: string,
  params: Partial<FetchWithPagination>
) => Promise<ResultWithPagination<AddressTxResponse>>) => {
  return async (endpoint: string, params: Partial<FetchWithPagination>) => {
    if (!address || !endpoint) {
      return;
    }
    const url = `${endpoint}/address/${address}/transactions`;
    const { data } = await axios.get(url, { params });
    if (data.data) {
      data.data = data.data.map((tx: any) => ({
        hash: tx.hash,
        block: {
          number: tx.blockNumber,
          timestamp: tx.timestamp,
        },
        value: displayWeiOrTara(ethers.BigNumber.from(tx.value)),
        gasPrice: ethers.BigNumber.from(tx.gasPrice || 0),
        gas: ethers.BigNumber.from(tx.gas || 0),
        status: tx.status ? 1 : 0,
        gasUsed: ethers.BigNumber.from(tx.gasUsed || 0),
        from: {
          address: tx.from,
        },
        to: {
          address: tx.to,
        },
        type: tx.type,
        action: getAddressTransactionType(tx.type),
      }));
    }
    return data;
  };
};
