import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { accountQuery } from '../../api/graphql/queries/account';
import { useExplorerNetwork, useExplorerLoader } from '../../hooks';
import { AddressInfoDetails, BlockData, Transaction } from '../../models';
import {
  useGetBlocksByAddress,
  useGetDagsByAddress,
  useGetDetailsForAddress,
  useGetPbftsByAddress,
  useGetTransactionsByAddress,
} from '../../api';

export interface TransactionResponse {
  hash: string;
  from: string;
  to: string;
  status: number;
  gasUsed: string;
  gasPrice: string;
  value: string;
  block: number;
  age: number;
}

export const useAddressInfoEffects = (
  account: string
): {
  transactions: Transaction[];
  addressInfoDetails: AddressInfoDetails;
  dagBlocks: BlockData[];
  pbftBlocks: BlockData[];
  totalPbftCount: number;
  rowsPbftPerPage: number;
  pbftPage: number;
  handlePbftChangePage: (newPage: number) => void;
  handlePbftChangeRowsPerPage: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  totalDagCount: number;
  rowsDagPerPage: number;
  dagPage: number;
  handleDagChangePage: (newPage: number) => void;
  handleDagChangeRowsPerPage: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
} => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dagBlocks, setDagBlocks] = useState<BlockData[]>([]);
  const [pbftBlocks, setPbftBlocks] = useState<BlockData[]>([]);

  const [totalPbftCount, setTotalPbftCount] = useState<number>(0);
  const [rowsPbftPerPage, setPbftRowsPerPage] = useState<number>(25);
  const [pbftPage, setPbftPage] = useState(0);

  const [totalDagCount, setTotalDagCount] = useState<number>(0);
  const [rowsDagPerPage, setDagRowsPerPage] = useState<number>(25);
  const [dagPage, setDagPage] = useState(0);

  const [addressInfoDetails, setAddressInfoDetails] =
    useState<AddressInfoDetails>();
  const [{ fetching, data }] = useQuery({
    query: accountQuery,
    variables: { account },
    pause: !account,
  });
  const { initLoading, finishLoading } = useExplorerLoader();
  const { backendEndpoint, currentNetwork } = useExplorerNetwork();
  const navigate = useNavigate();
  const [network] = useState(currentNetwork);

  const {
    data: nodeData,
    isFetching: isFetchingBlocks,
    isLoading: isLoadingBlocks,
  } = useGetBlocksByAddress(backendEndpoint, account);
  const {
    data: dagsData,
    isFetching: isFetchingDags,
    isLoading: isLoadingDags,
  } = useGetDagsByAddress(backendEndpoint, account, {
    rowsPerPage: rowsDagPerPage,
    page: dagPage,
  });
  const {
    data: pbftsData,
    isFetching: isFetchingPbfts,
    isLoading: isLoadingPbfts,
  } = useGetPbftsByAddress(backendEndpoint, account, {
    rowsPerPage: rowsPbftPerPage,
    page: pbftPage,
  });
  const {
    data: txData,
    isFetching: isFetchingTx,
    isLoading: isLoadingTx,
  } = useGetTransactionsByAddress(backendEndpoint, account);

  const {
    data: details,
    isFetching: isFetchingDetails,
    isLoading: isLoadingDetails,
  } = useGetDetailsForAddress(backendEndpoint, account);

  useEffect(() => {
    if (
      fetching ||
      isFetchingBlocks ||
      isLoadingBlocks ||
      isFetchingDags ||
      isLoadingDags ||
      isFetchingPbfts ||
      isLoadingPbfts ||
      isFetchingTx ||
      isLoadingTx ||
      isFetchingDetails ||
      isLoadingDetails
    ) {
      initLoading();
    } else {
      finishLoading();
    }
  }, [
    fetching,
    isFetchingBlocks,
    isLoadingBlocks,
    isFetchingDags,
    isLoadingDags,
    isFetchingPbfts,
    isLoadingPbfts,
    isFetchingTx,
    isLoadingTx,
    isFetchingDetails,
    isLoadingDetails,
  ]);

  useEffect(() => {
    if (dagsData?.data && dagsData?.total) {
      setDagBlocks(dagsData?.data as BlockData[]);
      setTotalDagCount(dagsData?.total);
    }
  }, [dagsData]);

  useEffect(() => {
    if (pbftsData?.data && pbftsData?.total) {
      setPbftBlocks(pbftsData?.data as BlockData[]);
      setTotalPbftCount(pbftsData?.total);
    }
  }, [pbftsData]);

  const formatToTransaction = (
    transactions: TransactionResponse[]
  ): Transaction[] => {
    if (transactions?.length === 0) {
      return [];
    }
    return transactions?.map((tx) => {
      return {
        hash: tx.hash,
        block: {
          number: tx.block,
          timestamp: tx.age,
        },
        value: ethers.BigNumber.from(tx.value),
        gasPrice: ethers.BigNumber.from(tx.gasPrice),
        gas: ethers.BigNumber.from(tx.gasUsed),
        status: tx.status,
        from: {
          address: tx.from,
        },
        to: {
          address: tx.to,
        },
      };
    });
  };

  useEffect(() => {
    if (txData?.data) {
      setTransactions(formatToTransaction(txData.data));
    }
  }, [txData]);

  const getFees = (transactions: TransactionResponse[], address: string) => {
    if (!transactions || !transactions?.length) {
      return 0;
    }
    const fromTransactions: TransactionResponse[] = transactions.filter(
      (tx: TransactionResponse) => tx.from === address
    );
    const sum = fromTransactions.reduce((accumulator: any, object) => {
      return Number(accumulator) + Number(object.gasUsed);
    }, 0);
    return sum;
  };

  useEffect(() => {
    const addressDetails: AddressInfoDetails = { ...addressInfoDetails };
    addressDetails.address = account;
    if (details?.data) {
      addressDetails.balance = ethers.utils.formatEther(
        ethers.BigNumber.from(details?.data.currentBalance)
      );
      addressDetails.value = details?.data.currentValue;
      addressDetails.valueCurrency = details?.data?.currency;
      addressDetails.totalReceived = ethers.utils.formatEther(
        ethers.BigNumber.from(details?.data.totalReceived)
      );
      addressDetails.totalSent = ethers.utils.formatEther(
        ethers.BigNumber.from(details?.data.totalSent)
      );
      addressDetails.pricePerTara = details?.data?.priceAtTimeOfCalculation;
    }
    if (data?.block) {
      addressDetails.address = data?.block?.account?.address;
    }
    if (nodeData?.data) {
      addressDetails.dagBlocks = nodeData?.data?.dags;
      addressDetails.pbftBlocks = nodeData?.data?.pbft;
    }
    if (txData?.data) {
      addressDetails.transactionCount = txData.data.length;
      addressDetails.fees = `${getFees(txData.data, account)}`;
    }
    setAddressInfoDetails(addressDetails);
  }, [details, data, nodeData, txData]);

  useEffect(() => {
    if (currentNetwork !== network) {
      navigate('/');
    }
  }, [currentNetwork, network]);

  const handlePbftChangePage = (newPage: number) => {
    setPbftPage(newPage);
  };

  const handlePbftChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPbftRowsPerPage(parseInt(event.target.value, 10));
    setPbftPage(0);
  };

  const handleDagChangePage = (newPage: number) => {
    setDagPage(newPage);
  };

  const handleDagChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDagRowsPerPage(parseInt(event.target.value, 10));
    setDagPage(0);
  };

  return {
    transactions,
    addressInfoDetails,
    dagBlocks,
    pbftBlocks,
    totalPbftCount,
    rowsPbftPerPage,
    pbftPage,
    handlePbftChangePage,
    handlePbftChangeRowsPerPage,
    totalDagCount,
    rowsDagPerPage,
    dagPage,
    handleDagChangePage,
    handleDagChangeRowsPerPage,
  };
};
