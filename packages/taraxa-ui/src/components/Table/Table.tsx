import React from 'react';
import clsx from 'clsx';
import {
  Table as MTable,
  TableCellBaseProps,
  TableProps as MTableProps,
  TableContainer as MTableContainer,
  TableContainerProps as MTableContainerProps,
  TableHead as MTableHead,
  TableHeadProps,
  TableBody as MTableBody,
  TableBodyProps,
  TableRow as MTableRow,
  TableRowProps as MTableRowProps,
  TableCell as MTableCell,
  TableCellProps as MTableCellProps,
  TablePagination as MTablePagination,
  TablePaginationProps as MTablePaginationProps,
  TableSortLabel as MTableSortLabel,
  TableSortLabelProps,
} from '@mui/material';

export interface TableContainerProps extends MTableContainerProps {
  classNames?: string[];
}

export interface TableProps extends MTableProps {
  classNames?: string[];
}

export interface TableRowProps extends MTableRowProps {
  classNames?: string[];
}

export interface TableCellProps extends MTableCellProps {
  classNames?: string[];
}

export type TablePaginationProps = MTablePaginationProps & {
  component?: React.ElementType<TableCellBaseProps>;
};

export const TableContainer = ({
  children,
  classNames = [],
  ...props
}: TableContainerProps) => {
  return (
    <MTableContainer className={clsx(...classNames)} {...props}>
      {children}
    </MTableContainer>
  );
};

export const Table = ({ children, classNames = [], ...props }: TableProps) => {
  return (
    <MTable className={clsx(...classNames)} {...props}>
      {children}
    </MTable>
  );
};

export const TableHead = ({ children, ...props }: TableHeadProps) => {
  return <MTableHead {...props}>{children}</MTableHead>;
};

export const TableBody = ({ children, ...props }: TableBodyProps) => {
  return <MTableBody {...props}>{children}</MTableBody>;
};

export const TableRow = ({
  children,
  classNames = [],
  ...props
}: TableRowProps) => {
  return (
    <MTableRow className={clsx(...classNames)} {...props}>
      {children}
    </MTableRow>
  );
};

export const TableCell = ({
  children,
  classNames = [],
  ...props
}: TableCellProps) => {
  return (
    <MTableCell className={clsx(...classNames)} {...props}>
      {children}
    </MTableCell>
  );
};

export const TablePagination = ({ ...props }: TablePaginationProps) => {
  return <MTablePagination {...props} />;
};

export const TableSortLabel = ({ children, ...props }: TableSortLabelProps) => {
  return <MTableSortLabel {...props}>{children}</MTableSortLabel>;
};
