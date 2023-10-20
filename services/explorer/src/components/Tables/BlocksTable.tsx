import React from 'react';
import {
  theme,
  Box,
  EmptyTable,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TableContainer,
} from '@taraxa_project/taraxa-ui';
import { HashLink } from '..';
import { BlockData } from '../../models';
import { HashLinkType, timestampToFormattedTime } from '../../utils';

export const BlocksTable: React.FC<{
  blocksData: BlockData[];
  type: 'pbft' | 'dag';
  totalCount?: number;
  pageNo: number;
  rowsPage?: number;
  changePage?: (p: number) => void;
  changeRows?: (l: number) => void;
}> = ({
  blocksData,
  type,
  totalCount,
  pageNo,
  rowsPage,
  changePage,
  changeRows,
}) => {
  const onRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    changeRows(parseInt(event.target.value, 10));
  const onPageChange = (event: unknown, newPage: number) => changePage(newPage);

  return (
    <Box display='flex' flexDirection='column' sx={{ width: '100%' }}>
      <Box display='flex' flexDirection='row' justifyContent='flex-end'>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component='div'
          count={totalCount || blocksData?.length || 0}
          rowsPerPage={rowsPage}
          component={'div' as any}
          page={pageNo}
          showFirstButton={true}
          showLastButton={true}
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
            {blocksData && blocksData.length > 0 ? (
              blocksData.map((block, i) => (
                <TableRow key={`${block.hash}-${i}`}>
                  <TableCell variant='body'>
                    {timestampToFormattedTime(block.timestamp)}
                  </TableCell>
                  {type === 'dag' && (
                    <TableCell variant='body'>{block.level}</TableCell>
                  )}
                  {type === 'pbft' && (
                    <TableCell variant='body'>{block.number}</TableCell>
                  )}
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
                  <TableCell variant='body'>{block.transactionCount}</TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyTable colspan={5} />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
