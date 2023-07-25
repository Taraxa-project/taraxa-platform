import { useCallback, useEffect, useState } from 'react';
import { ColumnData } from '../../models';
import { usePagination } from '../../hooks/usePagination';
import { Holder, useGetTokenPrice } from '../../api';
import { useExplorerLoader, useExplorerNetwork } from '../../hooks';
import { toHolderTableRow } from './HolderRow';
import { useGetHolders } from '../../api/indexer/fetchHolders';
import { useGetTotalSupply } from '../../api/indexer/fetchTotalSupply';
import { BigNumber } from 'ethers';

const cols: ColumnData[] = [
  { path: 'rank', name: 'Rank' },
  { path: 'address', name: 'Address' },
  { path: 'balance', name: 'Quantity' },
  { path: 'percentage', name: 'Percentage' },
  { path: 'value', name: 'Value' },
];

export const useHoldersEffects = () => {
  const { currentNetwork, indexerEndpoint } = useExplorerNetwork();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();
  const { data: tokenPriceData } = useGetTokenPrice();
  const { initLoading, finishLoading } = useExplorerLoader();

  const [totalSupply, setTotalSupply] = useState<BigNumber>(BigNumber.from(0));
  const [tableData, setTableData] = useState([]);
  const [start, setStart] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const fetchTotalSupply = useCallback(async () => {
    initLoading();
    try {
      const totalSupply = await useGetTotalSupply(indexerEndpoint);
      setTotalSupply(BigNumber.from(totalSupply));
    } catch (error) {
      console.log('error', error);
    } finally {
      finishLoading();
    }
  }, [indexerEndpoint]);

  const updateValidators = useCallback(async () => {
    initLoading();
    try {
      const holders = await useGetHolders(indexerEndpoint, {
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
  }, [rowsPerPage, start, indexerEndpoint]);

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
