import React from 'react';
import {
  Card as MCard,
  CardContent,
  CssBaseline,
  ThemeProvider,
  Typography,
} from '@material-ui/core';
import theme from '../theme';
import useStyles from './topcard-styles';

export interface TopCardProps {
  title: string;
  description: string;
  topData: JSX.Element;
  id?: string;
}

const TopCard = ({ title, description, topData, id }: TopCardProps) => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCard className={classes.root} id={id} elevation={0} variant="outlined">
        <CardContent className={classes.cardContent}>
          <div className={classes.iconContainer}>
            <Typography
              color="primary"
              variant="h4"
              component="h4"
              className={classes.bottomSpacing}
            >
              {title}
            </Typography>
            <Typography className={classes.label} variant="body1" color="primary">
              {description}
            </Typography>
          </div>

          <div className={classes.topData}>{topData}</div>
        </CardContent>
      </MCard>
    </ThemeProvider>
  );
};

export default TopCard;
