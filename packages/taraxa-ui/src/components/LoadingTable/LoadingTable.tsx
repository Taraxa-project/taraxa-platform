import React from 'react-responsive';
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

export interface LoadingTableProps {
  rows: number;
  cols: number;
  tableWidth: string;
}

const LoadingTable = ({ rows, cols, tableWidth }: LoadingTableProps) => {
  const rowsNo = Array.from(Array(rows || 10).keys());
  const colsNo = Array.from(Array(cols || 7).keys());
  return (
    <TableContainer>
      <Table className='table' width={tableWidth || '100%'}>
        <TableHead>
          <TableRow className='tableHeadRow'>
            {colsNo.map((col: number) => (
              <TableCell key={col} className='tableHeadCell'>
                <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rowsNo.map((row: number) => (
            <TableRow key={row} className='tableRow'>
              {colsNo.map((col: number) => (
                <TableCell key={col} className='tableHeadCell'>
                  <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LoadingTable;
