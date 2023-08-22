import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useQuery } from 'urql';
import { useExplorerNetwork, useExplorerLoader } from '../../hooks';
import { AddressInfoDetails } from '../../models';
import {
  addressDetailsQuery,
  useGetDagsByAddress,
  useGetPbftsByAddress,
  useGetAddressStats,
  useGetTransactionsByAddress,
} from '../../api';
import { balanceWeiToTara, formatTokensValue } from '../../utils';
import { useGetTokenPrice } from '../../api/fetchTokenPrice';
import { PaginationDataResults, useIndexer } from '../../hooks/useIndexer';

export const useAddressInfoEffects = (
  account: string
): {
  addressInfoDetails: AddressInfoDetails;
  showLoadingSkeleton: boolean;
  tabsStep: number;
  setTabsStep: React.Dispatch<React.SetStateAction<number>>;
  isFetchingAddressStats: boolean;
  isLoadingAddressStats: boolean;
  pbftTablePagination: PaginationDataResults;
  dagTablePagination: PaginationDataResults;
  txTablePagination: PaginationDataResults;
} => {
  const [tabsStep, setTabsStep] = useState<number>(0);

  const { initLoading, finishLoading } = useExplorerLoader();
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

  const pbftTablePagination = useIndexer(
    { queryName: 'address-pbfts', dependency: account },
    useGetPbftsByAddress(account)
  );
  const dagTablePagination = useIndexer(
    { queryName: 'address-dags', dependency: account },
    useGetDagsByAddress(account)
  );
  const txTablePagination = useIndexer(
    { queryName: 'address-txs', dependency: account },
    useGetTransactionsByAddress(account)
  );

  return {
    addressInfoDetails,
    showLoadingSkeleton,
    tabsStep,
    setTabsStep,
    isFetchingAddressStats,
    isLoadingAddressStats,
    pbftTablePagination,
    dagTablePagination,
    txTablePagination,
  };
};
