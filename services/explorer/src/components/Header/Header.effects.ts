/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Option } from '@taraxa_project/taraxa-ui/src/components/SearchInput/SearchInput';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import cleanDeep from 'clean-deep';
import { useQuery } from 'urql';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { unwrapIdentifier } from '../../utils';
import {
  searchAccountAddressQuery,
  searchBlockQuery,
  searchDagBlockQuery,
  searchTransactionQuery,
} from '../../api';

export type HeaderBtn = {
  label: string;
  onAction: () => void;
  selected: boolean;
  variant?: 'text' | 'outlined' | 'contained';
  color:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';
};

export enum SearchLabelOption {
  TRANSACTION = 'transaction',
  PBFT = 'pbft',
  DAG = 'dag',
  ADDRESS = 'address',
}

export const useHeaderEffects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { networks, currentNetwork, setNetwork, disableNetworkSelection } =
    useExplorerNetwork();
  const [drawerState, setDrawerState] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>(null);
  const [searchHash, setSearchHash] = useState<string>(null);
  const [searchBlockNumber, setSearchBlockNumber] = useState<number>(null);
  const [searchAddress, setSearchAddress] = useState<string>(null);
  const [searchOptions, setSearchOptions] = useState<Option[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [{ fetching: fetchingBlock, data: blockData }] = useQuery({
    query: searchBlockQuery,
    variables: cleanDeep({
      number: searchBlockNumber,
      hash: searchHash,
    }),
    pause: !searchBlockNumber && !searchHash,
  });

  const [{ fetching: fetchingDagBlock, data: dagBlockData }] = useQuery({
    query: searchDagBlockQuery,
    variables: {
      hash: searchHash,
    },
    pause: !searchHash,
  });

  const [{ fetching: fetchingTransaction, data: transactionData }] = useQuery({
    query: searchTransactionQuery,
    variables: {
      hash: searchHash,
    },
    pause: !searchHash,
  });

  const [{ fetching: fetchingAddress, data: addressData }] = useQuery({
    query: searchAccountAddressQuery,
    variables: {
      address: searchAddress,
    },
    pause: !searchAddress,
  });

  useEffect(() => {
    if (
      fetchingBlock ||
      fetchingDagBlock ||
      fetchingTransaction ||
      fetchingAddress
    ) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [fetchingBlock, fetchingDagBlock, fetchingTransaction, fetchingAddress]);

  useEffect(() => {
    if (blockData?.block) {
      const options: Option[] = [];
      if (searchHash) {
        options.push({
          type: 'Hash',
          label: blockData?.block?.hash,
          value: SearchLabelOption.PBFT,
        });
      }
      if (searchBlockNumber) {
        options.push({
          type: 'Block Number',
          label: blockData?.block?.number?.toString(),
          value: SearchLabelOption.PBFT,
        });
      }
      setSearchOptions(searchOptions.concat(options));
    }
  }, [blockData]);

  useEffect(() => {
    if (dagBlockData?.dagBlock) {
      setSearchOptions(
        searchOptions.concat([
          {
            type: 'Hash',
            label: dagBlockData?.dagBlock?.hash,
            value: SearchLabelOption.DAG,
          },
        ])
      );
    }
  }, [dagBlockData]);

  useEffect(() => {
    if (transactionData?.transaction) {
      setSearchOptions(
        searchOptions.concat([
          {
            type: 'Hash',
            label: transactionData?.transaction?.hash,
            value: SearchLabelOption.TRANSACTION,
          },
        ])
      );
    }
  }, [transactionData]);

  useEffect(() => {
    if (addressData?.account) {
      setSearchOptions(
        searchOptions.concat([
          {
            type: 'Address',
            label: addressData?.account?.address,
            value: SearchLabelOption.ADDRESS,
          },
        ])
      );
    }
  }, [addressData]);

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setDrawerState(open);
    };

  const onClick = (route: string) => {
    navigate(`/${route}`);
    setDrawerState(false);
  };

  const headerButtons: HeaderBtn[] = [
    {
      label: 'DAG',
      color: 'primary',
      variant: 'text',
      selected: false,
      onAction: () => onClick('dag'),
    },
    {
      label: 'PBFT',
      color: 'primary',
      variant: 'text',
      selected: false,
      onAction: () => onClick('block'),
    },
    {
      label: 'Transactions',
      color: 'primary',
      variant: 'text',
      selected: false,
      onAction: () => onClick('tx'),
    },
    {
      label: 'Nodes',
      color: 'primary',
      variant: 'text',
      selected: false,
      onAction: () => onClick('node'),
    },
    {
      label: 'Faucet',
      color: 'primary',
      variant: 'text',
      selected: false,
      onAction: () => onClick('faucet'),
    },
  ];
  const [buttons, setButtons] = useState<HeaderBtn[]>(headerButtons);

  const clearSearch = () => {
    setSearchOptions([]);
    setSearchHash(null);
    setSearchBlockNumber(null);
    setSearchAddress(null);
  };

  const onInputChange = (searchString: string) => {
    setSearchString(searchString);
    clearSearch();
    const { txHash, blockNumber, address } = unwrapIdentifier(searchString);
    if (txHash) setSearchHash(txHash);
    if (blockNumber) setSearchBlockNumber(blockNumber);
    if (address) setSearchAddress(address);
  };

  const onLabelSelect = (option: Option) => {
    setSearchOptions([]);
    setSearchString(null);
    if (!option) {
      return;
    }
    switch (option.value) {
      case SearchLabelOption.TRANSACTION:
        navigate(`/tx/${option.label}`);
        break;
      case SearchLabelOption.DAG:
        navigate(`/block/${option.label}`);
        break;
      case SearchLabelOption.PBFT:
        navigate(`/pbft/${option.label}`);
        break;
      case SearchLabelOption.ADDRESS:
        navigate(`/address/${option.label}`);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setButtons(
      headerButtons.map((btn) => {
        if (`/${btn.label.toLowerCase()}` === location.pathname)
          btn.selected = true;
        return btn;
      })
    );
  }, [location]);

  return {
    headerButtons,
    buttons,
    networks,
    currentNetwork,
    onInputChange,
    drawerState,
    toggleDrawer,
    isLoading,
    searchOptions,
    onLabelSelect,
    searchString,
    setNetwork,
    disableNetworkSelection,
  };
};
