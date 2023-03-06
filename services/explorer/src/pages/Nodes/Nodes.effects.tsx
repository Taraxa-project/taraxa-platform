import { useCallback, useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { ColumnData } from '../../models';
import { usePagination } from '../../hooks/usePagination';
import { RankedNode, useGetBlocksThisWeek, useGetValidators } from '../../api';
import { useExplorerNetwork } from '../../hooks';

const cols: ColumnData[] = [
  { path: 'rank', name: 'Rank' },
  { path: 'nodeAddress', name: 'Node Address' },
  { path: 'blocksProduced', name: '# blocks produced' },
];

export const useNodesEffects = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [weekNumber, setWeekNumber] = useState<number>(
    DateTime.now().weekNumber
  );
  const [year, setYear] = useState<number>(DateTime.now().year);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [start, setStart] = useState<number>(0);

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();
  const { backendEndpoint } = useExplorerNetwork();

  const { data: blocks } = useGetBlocksThisWeek(
    backendEndpoint,
    weekNumber,
    year
  );

  const updateValidators = useCallback(async () => {
    setLoading(true);
    try {
      const validators = await useGetValidators(
        backendEndpoint,
        weekNumber,
        year,
        {
          start,
          limit: rowsPerPage,
        }
      );

      setTableData(validators?.data || []);
      setTotalCount(validators?.total || 0);
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  }, [backendEndpoint, weekNumber, year, start, rowsPerPage]);

  useEffect(() => {
    updateValidators();
  }, [updateValidators]);

  const handlePreviousWeek = () => {
    if (weekNumber === 1) {
      setYear((year) => year - 1);
      setWeekNumber(DateTime.utc(year - 1, 12, 28).weekNumber);
    } else {
      setWeekNumber((weekNumber) => weekNumber - 1);
    }
    handleChangePage(0);
    setStart(0);
  };

  const handleNextWeek = () => {
    const lastWeekOfYear = DateTime.utc(year, 12, 28).weekNumber;
    if (weekNumber === lastWeekOfYear) {
      if (year < DateTime.now().year) {
        setYear((year) => year + 1);
        setWeekNumber(1);
      }
    } else if (weekNumber < lastWeekOfYear) {
      setWeekNumber((weekNumber) => weekNumber + 1);
    }
    handleChangePage(0);
    setStart(0);
  };

  const onChangePage = (p: number) => {
    setStart(totalCount - p * rowsPerPage);
    handleChangePage(p);
  };

  const onChangeRowsPerPage = (l: number) => {
    handleChangeRowsPerPage(l);
    setStart(0);
  };

  const monday = DateTime.fromObject({
    weekNumber: weekNumber,
    weekYear: year,
  })
    .startOf('week')
    .toFormat('LLL dd');
  const sunday = DateTime.fromObject({
    weekNumber: weekNumber,
    weekYear: year,
  })
    .endOf('week')
    .toFormat('LLL dd');
  const title = `Top nodes for Week ${weekNumber} ${year}`;
  const subtitle = `Top block producers for Week ${weekNumber} (${monday} - ${sunday})`;
  const description = 'Total blocks produced this week';

  return {
    blocks: blocks?.data,
    title,
    subtitle,
    description,
    cols,
    tableData: tableData.map((node: RankedNode, i: number) => ({
      rank: i + 1,
      address: node.address,
      pbftCount: node.pbftCount,
    })),
    totalCount,
    rowsPerPage,
    page,
    handleChangePage: onChangePage,
    handleChangeRowsPerPage: onChangeRowsPerPage,
    handlePreviousWeek,
    handleNextWeek,
    weekNumber,
    year,
    loading,
  };
};
