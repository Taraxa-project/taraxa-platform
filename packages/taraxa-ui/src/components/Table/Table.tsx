import React from 'react';
import useStyles from './table-styles';
import MTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import { useMediaQuery } from 'react-responsive';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import theme from '../theme';

export interface TableProps {
  columns: { path: string, name: string}[];
  rows: { Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>, data: any[] }[];
}

export default function Table({columns, rows}: TableProps) {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
  return (
    <ThemeProvider theme={theme}>
    <CssBaseline />
      <div className={classes.root}>
        <Paper className={isMobile ? classes.mobilePaper : classes.paper} elevation={0}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            SelectProps={{
              MenuProps: { classes: { paper: classes.tablePaginationList } }
            }}
            classes={{
              root: classes.tablePagination,
              caption: classes.tablePaginationCaption,
              selectIcon: classes.tablePaginationSelectIcon,
              select: classes.tablePaginationSelect,
              actions: classes.tablePaginationActions,
              menuItem: classes.tablePaginationSelect,
            }}
          />
          <TableContainer>
            <MTable
              className={classes.table}
              aria-labelledby="tableTitle"
              size='medium'
              aria-label="enhanced table"
            >
              <TableBody>
                { rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    row.data.map((rowData: any) => (
                      isMobile ?
                        <TableRow
                        // onClick={(event) => handleClick(event, row.username)}
                        tabIndex={-1}
                        key={index}
                        >
                        {row.Icon && <TableCell className={classes.mobileTableCell} align="left">{<row.Icon/>}</TableCell>}
                        {columns.map(({ path }) => (
                          (rowData[path] instanceof Date) ? 
                          <TableCell  className={classes.mobileDateTableCell}>
                            {moment(rowData[path]).fromNow()}
                          </TableCell> : 
                          <TableCell className={classes.mobileTableCell} align={!row.Icon ? 'center' : 'right'}>
                            {rowData[path]}
                          </TableCell>
                        ))}
                      </TableRow>
                      :
                      <TableRow
                        // onClick={(event) => handleClick(event, row.username)}
                        tabIndex={-1}
                        key={index}
                        >
                        {row.Icon && <TableCell className={classes.tableCell} align="left">{<row.Icon/>}</TableCell>}
                        {columns.map(({ path }) => (
                          (rowData[path] instanceof Date) ? 
                          <TableCell className={classes.dateTableCell} align={!row.Icon ? 'center' : 'right'}>
                            {moment(rowData[path]).fromNow()}
                          </TableCell> : 
                          <TableCell className={classes.tableCell} align={!row.Icon ? 'center' : 'right'}>
                            {rowData[path]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ))}
                
              </TableBody>
            </MTable>
          </TableContainer>
        </Paper>
      </div>
    </ThemeProvider>
  );
}
