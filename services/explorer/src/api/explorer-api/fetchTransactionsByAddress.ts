import axios from 'axios';
import { ethers } from 'ethers';
import { displayWeiOrTara } from '../../utils';
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
        gasPrice: displayWeiOrTara(ethers.BigNumber.from(tx.gasPrice)),
        gas: displayWeiOrTara(
          ethers.BigNumber.from(tx.gasPrice).mul(tx.gasUsed)
        ),
        status: tx.status ? 1 : 0,
        gasUsed: tx.gasUsed?.toString(),
        from: {
          address: tx.from,
        },
        to: {
          address: tx.to,
        },
        type: tx.type,
      }));
    }
    return data;
  };
};
