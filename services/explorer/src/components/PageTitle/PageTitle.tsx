import { Box, Typography } from '@taraxa_project/taraxa-ui';
import React, { FC } from 'react';

export interface PageTitleProps {
  title: string;
  subtitle: string;
}

export const PageTitle: FC<PageTitleProps> = ({ title, subtitle }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '2rem',
        marginBottom: '2.5rem',
      }}
    >
      <Typography variant='h3' component='h3'>
        {title}
      </Typography>
      <Typography color='text.secondary' variant='subtitle1' component='p'>
        {subtitle}
      </Typography>
    </Box>
  );
};
