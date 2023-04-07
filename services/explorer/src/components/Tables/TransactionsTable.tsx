import React from 'react';
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
import { Icons, EmptyTable } from '@taraxa_project/taraxa-ui';
import { theme } from '../../theme-provider';
import { AddressLink, HashLink } from '../Links';
import { statusToLabel, timestampToAge } from '../../utils/TransactionRow';
import { formatTransactionStatus, HashLinkType, zeroX } from '../../utils';
import { Transaction as TransactionBase } from '../../models';

export interface Transaction extends TransactionBase {
  timestamp?: number;
}

export interface TransactionsTableProps {
  transactionsData: Transaction[];
  totalCount?: number;
  pageNo: number;
  rowsPage?: number;
  changePage?: (p: number) => void;
  changeRows?: (l: number) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactionsData,
  totalCount,
  pageNo,
  rowsPage,
  changePage,
  changeRows,
}) => {
  const onRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    changeRows(parseInt(event.target.value, 10));
  const onPageChange = (event: unknown, p: number) => changePage(p);

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
          rowsPerPage={rowsPage}
          page={pageNo}
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
                Fee
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactionsData && transactionsData.length > 0 ? (
              transactionsData.map((tx, i) => (
                <TableRow key={`${tx.hash}-${i}`}>
                  <TableCell variant='body'>
                    <HashLink
                      linkType={HashLinkType.TRANSACTIONS}
                      hash={tx.hash}
                      disabled={tx.hash?.toLowerCase().startsWith('genesis')}
                      wrap
                    />
                  </TableCell>
                  <TableCell variant='body'>{tx.block?.number || 0}</TableCell>
                  <TableCell variant='body'>{tx.action}</TableCell>
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
                      <AddressLink
                        disabled={zeroX(
                          tx?.from?.address || (tx.from as string)
                        )
                          ?.toLowerCase()
                          .startsWith('0xgenesis')}
                        address={tx?.from?.address || (tx.from as string)}
                      />
                      <Icons.GreenRightArrow />
                      <AddressLink
                        disabled={zeroX(
                          tx.to?.address ||
                            (tx.to as string) ||
                            tx.createdContract?.address
                        )
                          ?.toLowerCase()
                          .startsWith('0xgenesis')}
                        address={
                          tx.to?.address ||
                          (tx.to as string) ||
                          tx.createdContract?.address
                        }
                      />
                    </Box>
                  </TableCell>
                  <TableCell variant='body' width='5rem !important'>
                    {statusToLabel(formatTransactionStatus(tx.status))}
                  </TableCell>
                  <TableCell variant='body' width='5rem !important'>
                    {timestampToAge(tx.block?.timestamp || tx.timestamp)}
                  </TableCell>
                  <TableCell variant='body' width='5rem !important'>
                    {tx.value?.toString()}
                  </TableCell>
                  <TableCell variant='body' width='5rem !important'>
                    {tx.gas?.toString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyTable colspan={8} />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
