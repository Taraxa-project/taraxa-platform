import { useCallback, useEffect, useState } from 'react';
import { ColumnData } from '../../models';
import { usePagination } from '../../hooks/usePagination';
import { FetchWithPaginationResult, Holder, useGetTokenPrice } from '../../api';
import { useExplorerLoader, useExplorerNetwork } from '../../hooks';
import { toHolderTableRow } from '../../utils';
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
  const [pagination, setPagination] = useState<FetchWithPaginationResult>({
    start: 0,
    limit: rowsPerPage,
    total: 0,
    hasNext: true,
  });

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
  }, [currentNetwork]);

  const updateValidators = useCallback(async () => {
    initLoading();
    try {
      const holders = await useGetHolders(indexerEndpoint, {
        start: pagination.start,
        limit: rowsPerPage,
      });

      setTableData(holders?.data || []);
      if (holders?.hasNext) {
        setPagination({
          ...pagination,
          start: pagination.start * rowsPerPage,
          hasNext: true,
          total: holders?.total || 0,
        });
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      finishLoading();
    }
  }, [rowsPerPage, start, currentNetwork]);

  useEffect(() => {
    fetchTotalSupply();
    updateValidators();
  }, [currentNetwork, updateValidators, fetchTotalSupply]);

  const handlePreviousPage = () => {
    setPagination({ ...pagination, start: pagination.start - rowsPerPage });
    setStart(start - rowsPerPage);
    handleChangePage(0);
  };

  const handleNextPage = () => {
    setPagination({ ...pagination, start: pagination.start + rowsPerPage });
    setStart(start + rowsPerPage);
    handleChangePage(0);
  };

  const onChangePage = (p: number) => {
    setPagination({ ...pagination, start: p * rowsPerPage });
    setStart(p * rowsPerPage);
    handleChangePage(p);
  };

  const onChangeRowsPerPage = (l: number) => {
    setPagination({ ...pagination, start: 0, limit: l });
    setStart(0);
    handleChangeRowsPerPage(l);
  };

  const title = `Top holders`;
  const description = `Current Top holders on TARAXA ${currentNetwork}`;

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
    pagination,
  };
};
