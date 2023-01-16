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
import React from 'react';
import { HashLink } from '..';
import { BlockData } from '../../models';
import { HashLinkType } from '../../utils';
import { timestampToAge } from '../../utils/TransactionRow';

export const BlocksTable: React.FC<{
  blocksData: BlockData[];
  type: 'pbft' | 'dag';
}> = ({ blocksData, type }) => {
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [page, setPage] = React.useState(0);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box display='flex' flexDirection='column' sx={{ width: '100%' }}>
      <Box display='flex' flexDirection='row' justifyContent='flex-end'>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component='div'
          count={blocksData?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
              <TableCell
                variant='head'
                style={{ backgroundColor: theme.palette.grey.A100 }}
              >
                Level
              </TableCell>
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
            {blocksData &&
              blocksData.length > 0 &&
              blocksData
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                ?.map((block, i) => (
                  <TableRow key={`${block.hash}-${i}`}>
                    <TableCell variant='body'>
                      {timestampToAge(block.timestamp)}
                    </TableCell>
                    <TableCell variant='body'>{block.level}</TableCell>
                    <TableCell variant='body'>
                      {type === 'pbft' && (
                        <HashLink
                          linkType={HashLinkType.PBFT}
                          hash={block.hash}
                        />
                      )}
                      {type === 'dag' && (
                        <HashLink
                          linkType={HashLinkType.BLOCKS}
                          hash={block.hash}
                        />
                      )}
                    </TableCell>
                    <TableCell variant='body'>
                      {block.transactionCount}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
