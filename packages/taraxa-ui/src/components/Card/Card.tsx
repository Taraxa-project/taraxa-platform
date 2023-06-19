import React from 'react';
import clsx from 'clsx';
import {
  Card as MCard,
  CardProps as MCardProps,
  CardContent,
  CardActions,
} from '@mui/material';

import useStyles from './Card.styles';

export interface CardProps extends MCardProps {
  actions?: JSX.Element;
  className?: string;
}

const Card = ({ children, actions, className }: CardProps) => {
  const classes = useStyles();
  return (
    <MCard
      className={clsx(classes.root, className)}
      elevation={0}
      variant='outlined'
    >
      <CardContent className={classes.content}>{children}</CardContent>
      {actions && (
        <CardActions className={classes.actions} disableSpacing>
          {actions}
        </CardActions>
      )}
    </MCard>
  );
};

export default Card;
