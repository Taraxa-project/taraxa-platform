import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { theme } from '@taraxa_project/taraxa-ui';
import React from 'react';
import { TransactionLink } from '../../components/Links';
import { BlockData } from '../../models/TableData';
import { timestampToAge } from '../../utils/TransactionRow';

export const DagTable: React.FC<{ dagData: BlockData }> = (props) => {
  const { dagData } = props;
  return (
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
        {dagData && (
          <TableRow>
            <TableCell variant='body'>
              {timestampToAge(dagData.timestamp)}
            </TableCell>
            <TableCell variant='body'>{dagData.level}</TableCell>
            <TableCell variant='body'>
              <TransactionLink txHash={dagData.txHash} />
            </TableCell>
            <TableCell variant='body'>{dagData.transactionCount}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
