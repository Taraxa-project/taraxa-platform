import React from 'react';
import { TableCell, TableRow } from '@mui/material';
import { NotFound } from '../Icons';
import useStyles from './EmptyTable.styles';

const EmptyTable = ({ colspan }: { colspan: number }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell colSpan={colspan} className={classes.tableCell}>
        <div className={classes.content}>
          <span className={classes.text}>
            <NotFound />
            <br />
            No data available yet...
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyTable;
