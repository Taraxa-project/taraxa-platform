import React from 'react';
import { Typography } from '@mui/material';
import useStyles from './PageTitle.styles';

export interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle = (props: PageTitleProps) => {
  const { title, subtitle } = props;
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography
        className={classes.title}
        color='primary'
        variant='h2'
        component='h2'
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          className={classes.subtitle}
          color='primary'
          variant='h4'
          component='h4'
        >
          {subtitle}
        </Typography>
      )}
    </div>
  );
};

export default PageTitle;
