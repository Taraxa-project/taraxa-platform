import React from 'react';
import {
  Box,
  TablePagination,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  EmptyTable,
} from '@taraxa_project/taraxa-ui';
import { PageTitle } from '../../components';
import { useHoldersEffects } from './Holders.effects';

const HoldersPage = (): JSX.Element => {
  const {
    title,
    description,
    cols,
    rows,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    total,
  } = useHoldersEffects();
  return (
    <>
      <PageTitle title={title} subtitle={description} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component='div'
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(
            event: React.MouseEvent<HTMLButtonElement> | null,
            page: number
          ) => {
            handleChangePage(page);
          }}
          onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleChangeRowsPerPage(parseInt(event.target.value, 10))
          }
        />
        <TableContainer sx={{ marginBottom: '2rem' }}>
          <Table style={{ tableLayout: 'auto', marginBottom: '2rem' }}>
            <TableHead>
              <TableRow tabIndex={-1} key='index'>
                {cols.map((column, index) => (
                  <TableCell key={`${index}-${index}-head`}>
                    {column.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows && rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow tabIndex={-1} data-key={index} key={index}>
                    <TableCell align='center'>
                      {row.rank + page * rowsPerPage}
                    </TableCell>
                    <TableCell align='center'>{row.address}</TableCell>
                    <TableCell align='center'>{row.balance}</TableCell>
                    <TableCell align='center'>{row.percentage}</TableCell>
                    <TableCell align='center'>{row.value}</TableCell>
                  </TableRow>
                ))
              ) : (
                <EmptyTable colspan={cols.length} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};
export default HoldersPage;
