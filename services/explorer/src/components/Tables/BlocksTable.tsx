import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Box,
  TablePagination,
} from '@mui/material';
import { theme } from '@taraxa_project/taraxa-ui';
import React, { useEffect, useState } from 'react';
import { HashLink } from '..';
import { BlockData } from '../../models';
import { HashLinkType } from '../../utils';
import { timestampToAge } from '../../utils/TransactionRow';

export const BlocksTable: React.FC<{
  blocksData: BlockData[];
  type: 'pbft' | 'dag';
  totalCount?: number;
  pageNo?: number;
  rowsPage?: number;
  changePage?: (pageNo: number) => void;
  changeRows?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({
  blocksData,
  type,
  totalCount,
  pageNo,
  rowsPage,
  changePage,
  changeRows,
}) => {
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<BlockData[]>([]);

  useEffect(() => {
    if (!pageNo && !rowsPage) {
      setData(
        blocksData?.slice(pageNo * rowsPage, pageNo * rowsPage + rowsPage)
      );
    } else {
      setData(blocksData);
    }
  }, [blocksData, page, rowsPerPage]);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof changeRows === 'function') {
      changeRows(event);
    } else {
      handleChangeRowsPerPage(event);
    }
  };

  const onPageChange = (event: unknown, newPage: number) => {
    if (typeof changePage === 'function') {
      changePage(newPage);
    } else {
      handleChangePage(newPage);
    }
  };

  return (
    <Box display='flex' flexDirection='column' sx={{ width: '100%' }}>
      <Box display='flex' flexDirection='row' justifyContent='flex-end'>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component='div'
          count={totalCount || blocksData?.length || 0}
          rowsPerPage={rowsPage || rowsPerPage}
          page={pageNo || page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </Box>
      <TableContainer sx={{ marginBottom: '2rem' }}>
        <Table style={{ tableLayout: 'auto', marginBottom: '2rem' }}>
          <TableHead style={{ backgroundColor: theme.palette.grey.A100 }}>
            <TableRow>
              <TableCell
                variant='head'
                style={{ backgroundColor: theme.palette.grey.A100 }}
              >
                Timestamp
              </TableCell>
              {type === 'dag' && (
                <TableCell
                  variant='head'
                  style={{ backgroundColor: theme.palette.grey.A100 }}
                >
                  Level
                </TableCell>
              )}
              {type === 'pbft' && (
                <TableCell
                  variant='head'
                  style={{ backgroundColor: theme.palette.grey.A100 }}
                >
                  Number
                </TableCell>
              )}
              <TableCell
                variant='head'
                style={{ backgroundColor: theme.palette.grey.A100 }}
              >
                Block Hash
              </TableCell>
              <TableCell
                variant='head'
                style={{ backgroundColor: theme.palette.grey.A100 }}
              >
                Transaction Count
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((block, i) => (
              <TableRow key={`${block.hash}-${i}`}>
                <TableCell variant='body'>
                  {timestampToAge(block.timestamp)}
                </TableCell>
                {type === 'dag' && (
                  <TableCell variant='body'>{block.level}</TableCell>
                )}
                {type === 'pbft' && (
                  <TableCell variant='body'>{block.number}</TableCell>
                )}
                <TableCell variant='body'>
                  {type === 'pbft' && (
                    <HashLink linkType={HashLinkType.PBFT} hash={block.hash} />
                  )}
                  {type === 'dag' && (
                    <HashLink
                      linkType={HashLinkType.BLOCKS}
                      hash={block.hash}
                    />
                  )}
                </TableCell>
                <TableCell variant='body'>{block.transactionCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
