import React from 'react';
import { Box, Typography } from '@taraxa_project/taraxa-ui';
import useStyles from './DataRow.styles';

export const DataRow: React.FC<{
  title: string;
  data: JSX.Element | string;
  wrap?: boolean;
}> = (props) => {
  const { title, data, wrap } = props;
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
        <Box
          className={`${classes.dataContainer} ${wrap ? classes.wrapText : ''}`}
        >
          {data}
        </Box>
      </Box>
    )
  );
};
