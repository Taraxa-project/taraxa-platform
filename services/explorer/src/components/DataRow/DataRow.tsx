import React from 'react';
import { Box, Typography } from '@mui/material';
import useStyles from './DataRow.styles';

export const DataRow: React.FC<{
  title: string;
  data: JSX.Element | string;
}> = (props) => {
  const { title, data } = props;
  const classes = useStyles();

  return (
    title &&
    data && (
      <Box className={classes.wrapper}>
        <Typography
          color='text.secondary'
          textTransform='uppercase'
          variant='subtitle1'
          component='p'
          width='14rem'
        >
          {title}:
        </Typography>
        <Box className={classes.dataContainer}>{data}</Box>
      </Box>
    )
  );
};
