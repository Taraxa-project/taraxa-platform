import React from 'react';
import { Box, Typography } from '@mui/material';

export const DataRow: React.FC<{
  title: string;
  data: JSX.Element | string;
}> = (props) => {
  const { title, data } = props;
  return (
    title &&
    data && (
      <Box
        display='flex'
        flexDirection='row'
        alignItems='center'
        alignContent='center'
      >
        <Typography
          color='text.secondary'
          variant='subtitle1'
          component='p'
          width='14rem'
        >
          {title}:
        </Typography>
        {data}
      </Box>
    )
  );
};
