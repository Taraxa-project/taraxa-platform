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
import { Button, Icons } from '@taraxa_project/taraxa-ui';
import type { TransactionData } from '../../models/TransactionData';
import { theme } from '../../theme-provider';
import { AddressLink, HashLink } from '../Links';
import { statusToLabel, timestampToAge } from '../../utils/TransactionRow';
import { HashLinkType } from '../../utils';
import { TransactionIcon } from '../icons';

export interface TransactionDataItem extends TransactionData {
  txHash: string;
  dagLevel: string;
  dagHash: string;
}

export interface AddressInfoTableProps {
  blockData: TransactionDataItem[];
  onFilter?: () => void;
  onDAGFilter?: () => void;
  onPBFTFilter?: () => void;
}

export const AddressInfoTable: React.FC<AddressInfoTableProps> = ({
  blockData = [],
  onFilter = () => ({}),
  onDAGFilter = () => ({}),
  onPBFTFilter = () => ({}),
}) => {
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
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
      <Box display='flex' flexDirection='row' justifyContent='space-between'>
        <Box display='flex' gap={2}>
          <Button
            Icon={TransactionIcon}
            label='Transactions'
            onClick={onFilter}
            size='medium'
            variant='contained'
            color='info'
          />
          <Button
            Icon={Icons.TransactionBlock}
            label='Transactions'
            onClick={onDAGFilter}
            size='medium'
            variant='contained'
            color='info'
          />
          <Button
            Icon={Icons.TransactionBlock}
            label='Transactions'
            onClick={onPBFTFilter}
            size='medium'
            variant='contained'
            color='info'
          />
        </Box>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={blockData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
            {blockData &&
              blockData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((block, i) => (
                  <TableRow key={`${block.txHash}-${i}`}>
                    <TableCell variant='body'>
                      <HashLink
                        linkType={HashLinkType.TRANSACTIONS}
                        hash={block.txHash}
                        wrap
                      />
                    </TableCell>
                    <TableCell variant='body'>{block.dagLevel}</TableCell>
                    <TableCell variant='body'>Transfer</TableCell>
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
                        <AddressLink address={block.from} />
                        <Icons.GreenRightArrow />
                        <AddressLink address={block.to} />
                      </Box>
                    </TableCell>
                    <TableCell variant='body' width='5rem !important'>
                      {statusToLabel(block.status)}
                    </TableCell>
                    <TableCell variant='body' width='5rem !important'>
                      {timestampToAge(block.timestamp)}
                    </TableCell>
                    <TableCell variant='body' width='5rem !important'>
                      {block.value}
                    </TableCell>
                    <TableCell variant='body' width='5rem !important'>
                      {(+block.gas).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
