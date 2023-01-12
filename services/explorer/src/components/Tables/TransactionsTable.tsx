import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  TablePagination,
  TableContainer,
} from '@mui/material';
import { Icons } from '@taraxa_project/taraxa-ui';
import { theme } from '../../theme-provider';
import { AddressLink, HashLink } from '../Links';
import { statusToLabel, timestampToAge } from '../../utils/TransactionRow';
import { formatTransactionStatus, HashLinkType } from '../../utils';
import { Transaction } from '../../models';

export interface TransactionsTableProps {
  transactionsData: Transaction[];
  totalCount?: number;
  pageNo?: number;
  rowsPage?: number;
  changePage?: (pageNo: number) => void;
  changeRows?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactionsData,
  totalCount,
  pageNo,
  rowsPage,
  changePage,
  changeRows,
}) => {
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!pageNo && !rowsPage) {
      setData(
        transactionsData.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        )
      );
    } else {
      setData(transactionsData);
    }
  }, [transactionsData, page, rowsPerPage]);

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
      <Box
        display='flex'
        flexDirection={{ xs: 'column', md: 'row', lg: 'row', xl: 'row' }}
        justifyContent='flex-end'
      >
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component='div'
          count={totalCount || transactionsData?.length || 0}
          rowsPerPage={rowsPage || rowsPerPage}
          page={pageNo || page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </Box>
      <TableContainer sx={{ marginBottom: '2rem' }}>
        <Table
          style={{
            tableLayout: 'auto',
            marginBottom: '2rem',
            marginTop: '1rem',
            minWidth: '100%',
          }}
        >
          <TableHead style={{ backgroundColor: theme.palette.grey.A100 }}>
            <TableRow>
              <TableCell
                variant='head'
                style={{ backgroundColor: theme.palette.grey.A100 }}
              >
                Hash
              </TableCell>
              <TableCell
                variant='head'
                style={{ backgroundColor: theme.palette.grey.A100 }}
              >
                Block
              </TableCell>
              <TableCell
                variant='head'
                style={{ backgroundColor: theme.palette.grey.A100 }}
              >
                Action
              </TableCell>
              <TableCell
                variant='head'
                style={{ backgroundColor: theme.palette.grey.A100 }}
              >
                FROM/TO
              </TableCell>
              <TableCell
                variant='head'
                style={{ backgroundColor: theme.palette.grey.A100 }}
              >
                Status
              </TableCell>
              <TableCell
                variant='head'
                style={{ backgroundColor: theme.palette.grey.A100 }}
              >
                Age
              </TableCell>
              <TableCell
                variant='head'
                style={{ backgroundColor: theme.palette.grey.A100 }}
              >
                Value
              </TableCell>
              <TableCell
                variant='head'
                style={{ backgroundColor: theme.palette.grey.A100 }}
              >
                Fee (TARA)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((tx, i) => (
              <TableRow key={`${tx.hash}-${i}`}>
                <TableCell variant='body'>
                  <HashLink
                    linkType={HashLinkType.TRANSACTIONS}
                    hash={tx.hash}
                    wrap
                  />
                </TableCell>
                <TableCell variant='body'>{tx.block?.number || 0}</TableCell>
                <TableCell variant='body'>
                  {tx.value ? 'Transfer' : 'Method call'}
                </TableCell>
                <TableCell variant='body'>
                  <Box
                    display='flex'
                    flexDirection='row'
                    alignItems='center'
                    alignContent='center'
                    justifyContent='space-evenly'
                    maxWidth='20rem'
                    gap='0.2rem'
                  >
                    <AddressLink address={tx.from?.address} />
                    <Icons.GreenRightArrow />
                    <AddressLink address={tx.to?.address} />
                  </Box>
                </TableCell>
                <TableCell variant='body' width='5rem !important'>
                  {statusToLabel(formatTransactionStatus(tx.status))}
                </TableCell>
                <TableCell variant='body' width='5rem !important'>
                  {timestampToAge(tx.block?.timestamp)}
                </TableCell>
                <TableCell variant='body' width='5rem !important'>
                  {tx.value?.toString()}
                </TableCell>
                <TableCell variant='body' width='5rem !important'>
                  {tx.gasUsed || 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
