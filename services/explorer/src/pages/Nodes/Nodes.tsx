import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  TablePagination,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  AwardCard,
  EmptyTable,
  MuiIcons,
} from '@taraxa_project/taraxa-ui';
import { PageTitle } from '../../components';
import { useNodesEffects } from './Nodes.effects';

const NodesPage = (): JSX.Element => {
  const {
    blocks,
    title,
    subtitle,
    description,
    cols,
    rows,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    totalCount,
    handlePreviousWeek,
    handleNextWeek,
    weekNumber,
    year,
    loading,
    weekPagination,
  } = useNodesEffects();
  return (
    <>
      <PageTitle title='Nodes' subtitle='List of TARAXA nodes on Mainnet' />
      {weekPagination && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '0.2rem',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
          mb={2}
        >
          <IconButton
            onClick={handlePreviousWeek}
            aria-label='previous'
            color='secondary'
            disabled={loading}
          >
            <MuiIcons.ArrowBackIos />
          </IconButton>
          <Typography color='secondary' fontSize='18px'>
            W{weekNumber} {year}
          </Typography>
          <IconButton
            onClick={handleNextWeek}
            disabled={!weekPagination.hasNext || loading}
            aria-label='next'
            color='secondary'
          >
            <MuiIcons.ArrowForwardIos />
          </IconButton>
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <AwardCard
          title={title}
          subtitle={subtitle}
          description={description}
          total={blocks?.total}
        />
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component={'div' as any}
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          showFirstButton={true}
          showLastButton={true}
          onPageChange={(
            event: React.MouseEvent<HTMLButtonElement> | null,
            page: number
          ) => handleChangePage(page)}
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
                    <TableCell align='center'>{row.nodeAddress}</TableCell>
                    <TableCell align='center'>{row.blocksProduced}</TableCell>
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
export default NodesPage;
