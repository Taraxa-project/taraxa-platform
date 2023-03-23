import axios from 'axios';
import { BigNumber } from 'ethers';
import { displayWeiOrTara } from '../../utils';
import {
  AddressTxResponse,
  FetchWithPagination,
  ResultWithPagination,
} from '../types';

export const useGetGenesisBlock = async (
  endpoint: string,
  params: Partial<FetchWithPagination>
): Promise<ResultWithPagination<AddressTxResponse>> => {
  const url = `${endpoint}/address/GENESIS/transactions`;
  const response = await axios.get(url, { params });
  return {
    ...response.data,
    data: response.data.data.map((tx: AddressTxResponse) => ({
      ...tx,
      status: tx.status ? 1 : 0,
      gasUsed: tx.gasUsed?.toString(),
      gasPrice: displayWeiOrTara(tx.gasPrice?.toString()),
      gas: displayWeiOrTara(
        parseInt(tx.gasUsed, 10) * parseInt(tx.gasPrice, 10)
      ),
      value: displayWeiOrTara(BigNumber.from(tx.value)),
    })),
  };
};
