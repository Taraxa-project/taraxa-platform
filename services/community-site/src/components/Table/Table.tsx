import React from 'react';
import clsx from 'clsx';
import {
  Table as MTable,
  TableProps as MTableProps,
  TableContainer as MTableContainer,
  TableContainerProps as MTableContainerProps,
  TableHead as MTableHead,
  TableHeadProps as MTableHeadProps,
  TableBody as MTableBody,
  TableBodyProps as MTableBodyProps,
  TableRow as MTableRow,
  TableRowProps as MTableRowProps,
  TableCell as MTableCell,
  TableCellProps as MTableCellProps,
} from '@mui/material';
import './table.scss';

export interface TableContainerProps extends MTableContainerProps {
  className?: string;
}

export interface TableProps extends MTableProps {
  className?: string;
}

export interface TableHeadProps extends MTableHeadProps {
  className?: string;
}

export interface TableBodyProps extends MTableBodyProps {
  className?: string;
}

export interface TableRowProps extends MTableRowProps {
  className?: string;
}

export interface TableCellProps extends MTableCellProps {
  className?: string;
}

export const TableContainer = ({ children, className }: TableContainerProps) => {
  return <MTableContainer className={clsx(className)}>{children}</MTableContainer>;
};

export const Table = ({ children, className }: TableProps) => {
  return <MTable className={clsx(className)}>{children}</MTable>;
};

export const TableHead = ({ children, className }: TableHeadProps) => {
  return <MTableHead className={clsx('tableHead', className)}>{children}</MTableHead>;
};

export const TableBody = ({ children, className }: TableBodyProps) => {
  return <MTableBody className={clsx('tableBody', className)}>{children}</MTableBody>;
};

export const TableRow = ({ children, className }: TableRowProps) => {
  return <MTableRow className={clsx('tableRow', className)}>{children}</MTableRow>;
};

export const TableCell = ({ children, className }: TableCellProps) => {
  return <MTableCell className={clsx('tableCell', className)}>{children}</MTableCell>;
};
