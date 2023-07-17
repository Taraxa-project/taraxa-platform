import { useCallback, useEffect, useState } from 'react';
import { ColumnData } from '../../models';
import { usePagination } from '../../hooks/usePagination';
import { FetchWithPaginationResult, Holder } from '../../api';
import { useExplorerNetwork } from '../../hooks';
import { Network, toHolderTableRow } from '../../utils';
import { useGetHolders } from 'src/api/indexer/fetchHolders';

const cols: ColumnData[] = [
  { path: 'rank', name: 'Rank' },
  { path: 'address', name: 'Holder Address' },
  { path: 'balance', name: 'Holder Balance' },
];

export const useHoldersEffects = () => {
  const { currentNetwork } = useExplorerNetwork();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();

  const [loading, setLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState<FetchWithPaginationResult>({
    start: 0,
    limit: rowsPerPage,
    total: 0,
    hasNext: true,
  });

  const updateValidators = useCallback(async () => {
    setLoading(true);
    let indexerEndpoint = '';
    switch (currentNetwork) {
      case Network.MAINNET:
        indexerEndpoint = process.env.REACT_APP_MAINNET_INDEXER_HOST || '';
        break;
      case Network.TESTNET:
        indexerEndpoint = process.env.REACT_APP_TESTNET_INDEXER_HOST || '';
        break;
      case Network.DEVNET:
        indexerEndpoint = process.env.REACT_APP_DEVNET_INDEXER_HOST || '';
        break;
      default:
        indexerEndpoint = process.env.REACT_APP_MAINNET_INDEXER_HOST || '';
        break;
    }
    try {
      const holders = await useGetHolders(indexerEndpoint, {
        start: pagination.start,
        limit: rowsPerPage,
      });

      setTableData(holders?.data || []);
      if (holders?.hasNext) {
        setPagination({
          ...pagination,
          start: pagination.start + rowsPerPage,
          hasNext: true,
          total: holders?.total || 0,
        });
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage]);

  useEffect(() => {
    updateValidators();
  }, [currentNetwork, updateValidators]);

  const handlePreviousPage = () => {
    setPagination({ ...pagination, start: pagination.start - rowsPerPage });
    handleChangePage(0);
  };

  const handleNextPage = () => {
    setPagination({ ...pagination, start: pagination.start + rowsPerPage });
    handleChangePage(0);
  };

  const onChangePage = (p: number) => {
    setPagination({ ...pagination, start: p * rowsPerPage });
    handleChangePage(p);
  };

  const onChangeRowsPerPage = (l: number) => {
    setPagination({ ...pagination, start: 0, limit: l });
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
        balance: holder.balance,
      })
    ),
    rowsPerPage,
    page,
    handleChangePage: onChangePage,
    handleChangeRowsPerPage: onChangeRowsPerPage,
    handlePreviousPage,
    handleNextPage,
    loading,
    pagination,
  };
};
