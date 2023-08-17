import React from 'react';
import Text from '../Text';
import Button from '../Button';
import { Left, Right } from '../Icons';

import useStyles from './Pagination.styles';

export interface PaginationProps {
  page: number;
  totalPages: number;
  prev: () => void;
  next: () => void;
}

const Pagination = ({ page, totalPages, prev, next }: PaginationProps) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.info}>
        <Text label={`Page ${page}/${totalPages}`} />
      </div>
      <div>
        <Button
          size='small'
          Icon={Left}
          className={classes.button}
          disabled={page === 1}
          onClick={prev}
        />
        <Button
          size='small'
          Icon={Right}
          className={classes.button}
          disabled={page >= totalPages}
          onClick={next}
        />
      </div>
    </div>
  );
};

export default Pagination;
