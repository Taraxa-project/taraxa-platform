import { useCallback, useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { ColumnData } from '../../models';
import { usePagination } from '../../hooks/usePagination';
import {
  RankedNode,
  useGetBlocksThisWeek,
  useGetValidators,
  WeekPagination,
} from '../../api';
import { useExplorerNetwork } from '../../hooks';
import { toNodeTableRow } from '../../utils';

const cols: ColumnData[] = [
  { path: 'rank', name: 'Rank' },
  { path: 'nodeAddress', name: 'Node Address' },
  { path: 'blocksProduced', name: '# blocks produced' },
];

export const useNodesEffects = (): {
  blocks: any;
  title: string;
  subtitle: string;
  description: string;
  cols: ColumnData[];
  rows: {
    rank: number;
    nodeAddress: JSX.Element;
    blocksProduced: string;
  }[];
  totalCount: number;
  rowsPerPage: number;
  page: number;
  handleChangePage: (p: number) => void;
  handleChangeRowsPerPage: (r: number) => void;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  weekNumber: number;
  year: number;
  loading: boolean;
  weekPagination: WeekPagination;
  pageSubtitle: string;
} => {
  const [loading, setLoading] = useState<boolean>(false);
  const [weekNumber, setWeekNumber] = useState<number>();
  const [year, setYear] = useState<number>();

  const [weekPagination, setWeekPagination] = useState<WeekPagination>();

  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [start, setStart] = useState<number>(0);

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();
  const { currentNetwork, backendEndpoint } = useExplorerNetwork();

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
      if (validators?.week) {
        setWeekPagination(validators?.week);
        setYear(validators?.week.year);
        setWeekNumber(validators?.week.week);
      }
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
    setStart(p * rowsPerPage);
    handleChangePage(p);
  };

  const onChangeRowsPerPage = (l: number) => {
    handleChangeRowsPerPage(l);
    setStart(0);
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return;
    const date = DateTime.fromSeconds(timestamp);
    const formattedDate = date.toFormat('MMM dd');
    return formattedDate;
  };

  const title = `Top nodes for Week ${weekNumber} ${year}`;
  const subtitle = `Top block producers for Week ${weekNumber} (${formatDate(
    weekPagination?.startDate
  )} - ${formatDate(weekPagination?.endDate)})`;
  const description = 'Total blocks produced this week';
  const pageSubtitle = `List of TARAXA nodes on ${currentNetwork}`;

  return {
    blocks: blocks?.data,
    title,
    subtitle,
    description,
    cols,
    rows: tableData.map((node: RankedNode, i: number) =>
      toNodeTableRow({
        rank: i + 1,
        address: node.address,
        pbftCount: node.pbftCount,
      })
    ),
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
    weekPagination,
    pageSubtitle,
  };
};
