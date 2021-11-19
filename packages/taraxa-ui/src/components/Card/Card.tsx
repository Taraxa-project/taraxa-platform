import React from 'react';
import {
  Card as MCard,
  CardProps as MCardProps,
  CardContent,
  CardActions,
  CssBaseline,
  ThemeProvider,
} from '@material-ui/core';

import theme from '../theme';

import useStyles from './card-styles';

interface CardProps extends MCardProps {
  actions: JSX.Element;
}

const Card = ({ children, actions }: CardProps) => {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCard className={classes.root} elevation={0} variant="outlined">
        <CardContent className={classes.content}>{children}</CardContent>
        {actions && (
          <CardActions className={classes.actions} disableSpacing>
            {actions}
          </CardActions>
        )}
      </MCard>
    </ThemeProvider>
  );
};

export default Card;
