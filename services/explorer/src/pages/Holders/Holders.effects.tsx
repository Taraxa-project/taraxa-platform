import { useCallback, useEffect, useState } from 'react';
import { ColumnData } from '../../models';
import { usePagination } from '../../hooks/usePagination';
import {
  Holder,
  useGetHolders,
  useGetTokenPrice,
  useGetTotalSupply,
} from '../../api';
import { useExplorerLoader, useExplorerNetwork } from '../../hooks';
import { useAddressLabel } from '../../hooks/useAddressLabel';
import { toHolderTableRow } from './HolderRow';
import { BigNumber } from 'ethers';

const cols: ColumnData[] = [
  { path: 'rank', name: 'Rank' },
  { path: 'address', name: 'Address' },
  { path: 'balance', name: 'Quantity' },
  { path: 'percentage', name: 'Percentage' },
  { path: 'value', name: 'Value' },
];

export const useHoldersEffects = (): {
  title: string;
  description: string;
  cols: ColumnData[];
  rows: {
    rank: number;
    address: JSX.Element;
    balanceStr: string;
    percentage: JSX.Element;
    value: string;
  }[];
  rowsPerPage: number;
  page: number;
  handleChangePage: (p: number) => void;
  handleChangeRowsPerPage: (r: number) => void;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  start: number;
  total: number;
} => {
  const { currentNetwork, backendEndpoint } = useExplorerNetwork();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();
  const { data: tokenPriceData } = useGetTokenPrice();
  const { initLoading, finishLoading } = useExplorerLoader();
  const { findLabelFor } = useAddressLabel();

  const [totalSupply, setTotalSupply] = useState<BigNumber>(BigNumber.from(0));
  const [tableData, setTableData] = useState([]);
  const [start, setStart] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const fetchTotalSupply = useCallback(async () => {
    initLoading();
    try {
      const totalSupply = await useGetTotalSupply(backendEndpoint);
      setTotalSupply(BigNumber.from(totalSupply));
    } catch (error) {
      console.log('error', error);
    } finally {
      finishLoading();
    }
  }, [backendEndpoint]);

  const updateValidators = useCallback(async () => {
    initLoading();
    try {
      const holders = await useGetHolders(backendEndpoint, {
        start,
        limit: rowsPerPage,
      });
      if (holders?.total) setTotal(holders?.total);
      setTableData(holders?.data || []);
    } catch (error) {
      console.log('error', error);
    } finally {
      finishLoading();
    }
  }, [rowsPerPage, start, backendEndpoint]);

  useEffect(() => {
    fetchTotalSupply();
    updateValidators();
  }, [currentNetwork, updateValidators, fetchTotalSupply]);

  const handlePreviousPage = () => {
    setStart(start - rowsPerPage);
    handleChangePage((start - rowsPerPage) / rowsPerPage);
  };

  const handleNextPage = () => {
    setStart(start + rowsPerPage);
    handleChangePage((start + rowsPerPage) / rowsPerPage);
  };

  const onChangePage = (p: number) => {
    setStart(p * rowsPerPage);
    handleChangePage(p);
  };

  const onChangeRowsPerPage = (l: number) => {
    setStart(0);
    handleChangeRowsPerPage(l);
  };

  const title = `Holders`;
  const description = `Current holders on Taraxa ${currentNetwork}`;

  return {
    title,
    description,
    cols,
    rows: tableData.map((holder: Holder, i: number) =>
      toHolderTableRow({
        rank: i + 1,
        address: holder.address,
        label: findLabelFor(holder.address),
        balance: BigNumber.from(holder.balance || '0'),
        totalSupply: totalSupply || BigNumber.from(0),
        taraPrice: (tokenPriceData?.data[0].current_price as number) || 0,
      })
    ),
    rowsPerPage,
    page,
    handleChangePage: onChangePage,
    handleChangeRowsPerPage: onChangeRowsPerPage,
    handlePreviousPage,
    handleNextPage,
    start,
    total,
  };
};
