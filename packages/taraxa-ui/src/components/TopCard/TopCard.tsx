import React from 'react';
import { Card as MCard, CardContent, Typography } from '@mui/material';
import useStyles from './TopCard.styles';

export interface TopCardProps {
  title: string;
  description: string;
  topData: JSX.Element;
  id?: string;
}

const TopCard = ({ title, description, topData, id }: TopCardProps) => {
  const classes = useStyles();

  return (
    <MCard className={classes.root} id={id} elevation={0} variant='outlined'>
      <CardContent className={classes.cardContent}>
        <div className={classes.iconContainer}>
          <Typography
            color='primary'
            variant='h4'
            component='h4'
            className={classes.bottomSpacing}
          >
            {title}
          </Typography>
          <Typography className={classes.label} variant='body1' color='primary'>
            {description}
          </Typography>
        </div>

        <div className={classes.topData}>{topData}</div>
      </CardContent>
    </MCard>
  );
};

export default TopCard;
