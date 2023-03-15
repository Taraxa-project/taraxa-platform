import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useExplorerNetwork, useExplorerLoader } from '../../hooks';
import { AddressInfoDetails, BlockData, Transaction } from '../../models';
import {
  addressDetailsQuery,
  useGetDagsByAddress,
  useGetPbftsByAddress,
  useGetAddressStats,
  useGetTransactionsByAddress,
} from '../../api';
import { balanceWeiToTara, formatTokensValue } from '../../utils';
import { useQuery } from 'urql';
import { useGetTokenPrice } from '../../api/fetchTokenPrice';
import { useIndexer } from '../../hooks/useIndexer';

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
  handlePbftChangePage: (p: number) => void;
  handlePbftChangeRowsPerPage: (l: number) => void;
  totalDagCount: number;
  rowsDagPerPage: number;
  dagPage: number;
  handleDagChangePage: (p: number) => void;
  handleDagChangeRowsPerPage: (l: number) => void;
  totalTxCount: number;
  rowsTxPerPage: number;
  txPage: number;
  handleTxChangePage: (p: number) => void;
  handleTxChangeRowsPerPage: (l: number) => void;
  showLoadingSkeleton: boolean;
  tabsStep: number;
  setTabsStep: (step: number) => void;
  isFetchingAddressStats: boolean;
  isLoadingAddressStats: boolean;
  isLoadingTables: boolean;
} => {
  const [tabsStep, setTabsStep] = useState<number>(0);

  const { initLoading, finishLoading } = useExplorerLoader();
  const [isLoadingTables, setIsLoadingTables] = useState<boolean>(false);
  const { backendEndpoint } = useExplorerNetwork();
  const [showLoadingSkeleton, setShowLoadingSkeleton] =
    useState<boolean>(false);
  const [addressInfoDetails, setAddressInfoDetails] =
    useState<AddressInfoDetails>();

  const [{ fetching: fetchingDetails, data: accountDetails }] = useQuery({
    query: addressDetailsQuery,
    variables: {
      account,
    },
    pause: !account,
  });

  const {
    data: addressStats,
    isFetching: isFetchingAddressStats,
    isLoading: isLoadingAddressStats,
  } = useGetAddressStats(backendEndpoint, account);

  const { data: tokenPriceData } = useGetTokenPrice();

  useEffect(() => {
    if (fetchingDetails) {
      initLoading();
      setShowLoadingSkeleton(true);
    } else {
      finishLoading();
      setShowLoadingSkeleton(false);
    }
  }, [fetchingDetails]);

  useEffect(() => {
    const addressDetails: AddressInfoDetails = { ...addressInfoDetails };
    addressDetails.address = account;

    if (addressStats?.data) {
      addressDetails.dagBlocks = addressStats?.data?.dagsCount;
      addressDetails.pbftBlocks = addressStats?.data?.pbftCount;
    }

    if (accountDetails) {
      const account = accountDetails?.block?.account;
      addressDetails.balance = balanceWeiToTara(account?.balance);
      addressDetails.transactionCount = account?.transactionCount;
    }

    if (tokenPriceData?.data) {
      const price = tokenPriceData.data[0].current_price as number;
      addressDetails.pricePerTara = price;
      addressDetails.valueCurrency = 'USD';

      if (accountDetails?.block?.account) {
        const currentValue =
          +ethers.utils.formatUnits(
            accountDetails?.block?.account?.balance,
            'ether'
          ) * price;
        addressDetails.value = formatTokensValue(currentValue);
      }
    }
    setAddressInfoDetails(addressDetails);
  }, [accountDetails, tokenPriceData, addressStats]);

  const {
    data: pbftBlocks,
    total: totalPbftCount,
    page: pbftPage,
    rowsPerPage: rowsPbftPerPage,
    handleChangePage: handlePbftChangePage,
    handleChangeRowsPerPage: handlePbftChangeRowsPerPage,
  } = useIndexer(useGetPbftsByAddress(account));

  const {
    data: dagBlocks,
    total: totalDagCount,
    page: dagPage,
    rowsPerPage: rowsDagPerPage,
    handleChangePage: handleDagChangePage,
    handleChangeRowsPerPage: handleDagChangeRowsPerPage,
  } = useIndexer(useGetDagsByAddress(account));

  const {
    data: transactions,
    total: totalTxCount,
    page: txPage,
    rowsPerPage: rowsTxPerPage,
    handleChangePage: handleTxChangePage,
    handleChangeRowsPerPage: handleTxChangeRowsPerPage,
  } = useIndexer(useGetTransactionsByAddress(account));

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
    isFetchingAddressStats,
    isLoadingAddressStats,
    isLoadingTables,
  };
};
