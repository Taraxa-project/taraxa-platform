import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useExplorerNetwork, useExplorerLoader } from '../../hooks';
import { AddressInfoDetails, BlockData, Transaction } from '../../models';
import {
  addressDetailsQuery,
  useGetDagsByAddress,
  useGetPbftsByAddress,
  useGetDagsCountByAddress,
  useGetPbftsCountByAddress,
  useGetTransactionsByAddress,
} from '../../api';
import { displayWeiOrTara, fromWeiToTara } from '../../utils';
import { useQuery } from 'urql';
import { useGetTokenPrice } from '../../api/fetchTokenPrice';

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
  totalTxCount: number;
  rowsTxPerPage: number;
  txPage: number;
  handleTxChangePage: (newPage: number) => void;
  handleTxChangeRowsPerPage: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  showLoadingSkeleton: boolean;
  tabsStep: number;
  setTabsStep: (step: number) => void;
  isFetchingDagsCount: boolean;
  isLoadingDagsCount: boolean;
  isFetchingPbftsCount: boolean;
  isLoadingPbftsCount: boolean;
} => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dagBlocks, setDagBlocks] = useState<BlockData[]>([]);
  const [pbftBlocks, setPbftBlocks] = useState<BlockData[]>([]);
  const [tabsStep, setTabsStep] = useState<number>(0);

  const [totalPbftCount, setTotalPbftCount] = useState<number>(0);
  const [rowsPbftPerPage, setPbftRowsPerPage] = useState<number>(25);
  const [pbftPage, setPbftPage] = useState(0);

  const [totalDagCount, setTotalDagCount] = useState<number>(0);
  const [rowsDagPerPage, setDagRowsPerPage] = useState<number>(25);
  const [dagPage, setDagPage] = useState(0);

  const [totalTxCount, setTotalTxCount] = useState<number>(0);
  const [rowsTxPerPage, setTxRowsPerPage] = useState<number>(25);
  const [txPage, setTxPage] = useState(0);

  const [addressInfoDetails, setAddressInfoDetails] =
    useState<AddressInfoDetails>();

  const { initLoading, finishLoading } = useExplorerLoader();
  const { backendEndpoint } = useExplorerNetwork();
  const [showLoadingSkeleton, setShowLoadingSkeleton] =
    useState<boolean>(false);

  const {
    data: dagsCount,
    isFetching: isFetchingDagsCount,
    isLoading: isLoadingDagsCount,
  } = useGetDagsCountByAddress(backendEndpoint, account);

  const {
    data: pbftsCount,
    isFetching: isFetchingPbftsCount,
    isLoading: isLoadingPbftsCount,
  } = useGetPbftsCountByAddress(backendEndpoint, account);

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
  } = useGetTransactionsByAddress(backendEndpoint, account, {
    rowsPerPage: rowsTxPerPage,
    page: txPage,
  });

  const {
    data: tokenPriceData,
    isFetching: isFetchingTokenPrice,
    isLoading: isLoadingTokenPrice,
  } = useGetTokenPrice();

  const [{ fetching: fetchingDetails, data: accountDetails }] = useQuery({
    query: addressDetailsQuery,
    variables: {
      account,
    },
    pause: !account,
  });

  useEffect(() => {
    if (
      fetchingDetails ||
      isFetchingTokenPrice ||
      isLoadingTokenPrice ||
      isFetchingDags ||
      isLoadingDags ||
      isFetchingPbfts ||
      isLoadingPbfts ||
      isFetchingTx ||
      isLoadingTx
    ) {
      initLoading();
      setShowLoadingSkeleton(true);
    } else {
      finishLoading();
      setShowLoadingSkeleton(false);
    }
  }, [
    fetchingDetails,
    isFetchingTokenPrice,
    isLoadingTokenPrice,
    isFetchingDags,
    isLoadingDags,
    isFetchingPbfts,
    isLoadingPbfts,
    isFetchingTx,
    isLoadingTx,
  ]);

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
        value: displayWeiOrTara(
          tx.value !== null && tx.value !== undefined
            ? ethers.BigNumber.from(BigInt(Math.round(+tx.value)))
            : null
        ),
        gasPrice: displayWeiOrTara(
          tx.gasPrice !== null && tx.gasPrice !== undefined
            ? ethers.BigNumber.from(tx.gasPrice)
            : null
        ),
        gas: displayWeiOrTara(
          tx.gasUsed !== null && tx.gasUsed !== undefined
            ? ethers.BigNumber.from(tx.gasUsed)
            : null
        ),
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
    if (txData?.data && txData?.total !== undefined && txData?.total !== null) {
      setTransactions(formatToTransaction(txData.data));
      setTotalTxCount(txData?.total);
    }
  }, [txData]);

  useEffect(() => {
    if (
      dagsData?.data &&
      dagsData?.total !== undefined &&
      dagsData?.total !== null
    ) {
      setDagBlocks(dagsData?.data as BlockData[]);
      setTotalDagCount(dagsData?.total);
    }
  }, [dagsData]);

  useEffect(() => {
    if (
      pbftsData?.data &&
      pbftsData?.total !== undefined &&
      pbftsData?.total !== null
    ) {
      setPbftBlocks(pbftsData?.data as BlockData[]);
      setTotalPbftCount(pbftsData?.total);
    }
  }, [pbftsData]);

  useEffect(() => {
    const addressDetails: AddressInfoDetails = { ...addressInfoDetails };
    addressDetails.address = account;

    if (dagsCount?.data) {
      addressDetails.dagBlocks = dagsCount?.data?.total;
    }

    if (pbftsCount?.data) {
      addressDetails.pbftBlocks = pbftsCount?.data?.total;
    }

    if (accountDetails) {
      const account = accountDetails?.block?.account;
      addressDetails.balance = fromWeiToTara(
        ethers.BigNumber.from(account?.balance)
      );
      addressDetails.transactionCount = account?.transactionCount;
    }

    if (tokenPriceData?.data) {
      const price = tokenPriceData.data[0].current_price as number;
      const priceAtTimeOfCalculation = Number(price.toFixed(6));
      addressDetails.pricePerTara = priceAtTimeOfCalculation;
      addressDetails.valueCurrency = 'USD';

      if (accountDetails?.block?.account) {
        const currentValue =
          +ethers.utils.formatUnits(
            accountDetails?.block?.account?.balance,
            'ether'
          ) * price;
        addressDetails.value = `${currentValue}`;
      }
    }
    setAddressInfoDetails(addressDetails);
  }, [
    accountDetails,
    tokenPriceData,
    dagsData,
    pbftsData,
    dagsCount,
    pbftsCount,
  ]);

  const handlePbftChangePage = (newPage: number) => {
    setPbftPage(newPage);
  };

  const handlePbftChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTotalPbftCount(0);
    setPbftRowsPerPage(parseInt(event.target.value, 10));
    setPbftPage(0);
  };

  const handleDagChangePage = (newPage: number) => {
    setDagPage(newPage);
  };

  const handleDagChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTotalDagCount(0);
    setDagRowsPerPage(parseInt(event.target.value, 10));
    setDagPage(0);
  };

  const handleTxChangePage = (newPage: number) => {
    setTxPage(newPage);
  };

  const handleTxChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTotalTxCount(0);
    setTxRowsPerPage(parseInt(event.target.value, 10));
    setTxPage(0);
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
    totalTxCount,
    rowsTxPerPage,
    txPage,
    handleTxChangePage,
    handleTxChangeRowsPerPage,
    showLoadingSkeleton,
    tabsStep,
    setTabsStep,
    isFetchingDagsCount,
    isLoadingDagsCount,
    isFetchingPbftsCount,
    isLoadingPbftsCount,
  };
};
