import React from 'react';
import {
  CssBaseline,
  ThemeProvider,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Table as MTable,
  TableHead,
} from '@mui/material';

import moment from 'moment';
import { useMediaQuery } from 'react-responsive';
import useStyles from './Table.styles';
import theme from '../theme';
import EmptyTable from '../EmptyTable';

export interface TableProps {
  columns: { path: string; name: string }[];
  rows: {
    Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    data: any[];
  }[];
  fixedLayout?: boolean;
}

export default function Table({
  columns,
  rows,
  fixedLayout = true,
}: TableProps) {
  const classes = useStyles();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TableContainer>
        <MTable
          className={classes.table}
          aria-labelledby='tableTitle'
          size='medium'
          aria-label='enhanced table'
          style={
            fixedLayout ? { tableLayout: 'fixed' } : { tableLayout: 'auto' }
          }
        >
          <TableHead>
            <TableRow tabIndex={-1} key='index'>
              {columns.map((column, index) => (
                <TableCell key={`${index}-${index}-head`}>
                  {column.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows && rows.length > 0 ? (
              rows.map((row, index) =>
                row.data.map((rowData: any) =>
                  isMobile ? (
                    <TableRow tabIndex={-1} key={index}>
                      {row.Icon && (
                        <TableCell
                          className={classes.mobileTableCell}
                          align='left'
                          key={`${index}-${index}`}
                        >
                          <row.Icon />
                        </TableCell>
                      )}
                      {columns.map(({ path }, j) =>
                        rowData[path] instanceof Date ? (
                          <TableCell
                            className={classes.mobileDateTableCell}
                            key={`${index}-${j}`}
                          >
                            {moment(rowData[path]).fromNow()}
                          </TableCell>
                        ) : (
                          <TableCell
                            className={classes.mobileTableCell}
                            align={!row.Icon ? 'center' : 'right'}
                            key={`${index}-${j}`}
                          >
                            {rowData[path]}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ) : (
                    <TableRow tabIndex={-1} key={index}>
                      {row.Icon && (
                        <TableCell
                          className={classes.tableCell}
                          align='left'
                          key={`${index}-${index}-icon`}
                        >
                          <row.Icon />
                        </TableCell>
                      )}
                      {columns.map(({ path }, i) =>
                        rowData[path] instanceof Date ? (
                          <TableCell
                            className={classes.dateTableCell}
                            align={!row.Icon ? 'center' : 'right'}
                            key={`${index}-${index}-date`}
                          >
                            {moment(rowData[path]).fromNow()}
                          </TableCell>
                        ) : (
                          <TableCell
                            className={classes.tableCell}
                            align={!row.Icon ? 'center' : 'right'}
                            key={`${index}-${i}`}
                          >
                            {rowData[path]}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  )
                )
              )
            ) : (
              <EmptyTable colspan={columns.length} />
            )}
          </TableBody>
        </MTable>
      </TableContainer>
    </ThemeProvider>
  );
}
