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
  head?: boolean;
}

export interface TableCellProps extends MTableCellProps {
  className?: string;
  head?: boolean;
}

export const TableContainer = ({ children, className }: TableContainerProps) => {
  return <MTableContainer className={clsx(className)}>{children}</MTableContainer>;
};

export const Table = ({ children, className }: TableProps) => {
  return <MTable className={clsx(className)}>{children}</MTable>;
};

export const TableHead = ({ children, className }: TableHeadProps) => {
  return <MTableHead className={clsx(className)}>{children}</MTableHead>;
};

export const TableBody = ({ children, className }: TableBodyProps) => {
  return <MTableBody className={clsx(className)}>{children}</MTableBody>;
};

export const TableRow = ({ children, className, head = false }: TableRowProps) => {
  return (
    <MTableRow className={clsx(!head && 'tableRow', head && 'tableHeadRow', className)}>
      {children}
    </MTableRow>
  );
};

export const TableCell = ({ children, className, head = false }: TableCellProps) => {
  return (
    <MTableCell className={clsx(!head && 'tableCell', head && 'tableHeadCell', className)}>
      {children}
    </MTableCell>
  );
};
