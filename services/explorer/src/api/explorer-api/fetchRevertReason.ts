import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';
import { Transaction } from 'src/models';

const getRevertReason = (endpoint: string, tx: Transaction) => {
  if (!tx || !endpoint) {
    return;
  }
  const rpcBody = {
    method: 'eth_call',
    params: [
      {
        from: tx.from.address,
        to: tx.to.address,
        gas: tx.gas,
        gasPrice: tx.gasPrice.toString().includes('Wei')
          ? tx.gasPrice.toString().replace('Wei', '')
          : tx.gasPrice.toString(),
        value: tx.value,
        data: tx.inputData,
      },
      `0x${tx.block.number.toString(16)}`,
    ],
    id: 1,
    jsonrpc: '2.0',
  };
  // eslint-disable-next-line consistent-return
  return axios.post(endpoint, rpcBody);
};

export const useGetRevertReason = (
  endpoint: string,
  tx: Transaction
): {
  data: AxiosResponse<any>;
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
} => {
  const { data, isError, error, isLoading, isFetching } = useQuery(
    ['revert-reason', tx, endpoint],
    () => getRevertReason(endpoint, tx),
    {
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.log('ERROR: ', error);
      },
      enabled: !!endpoint && !!tx && tx.status === 0,
    }
  );
  return {
    data,
    isError,
    error,
    isLoading,
    isFetching,
  };
};
