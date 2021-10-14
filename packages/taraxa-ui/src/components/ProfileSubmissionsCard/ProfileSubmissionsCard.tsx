import React from 'react';
import {
  Card as MCard,
  CardProps as MCardProps,
  ThemeProvider,
  CardContent,
  CssBaseline,
} from '@material-ui/core';
import theme from '../theme';
import useStyles from './profilesubmissionscard-styles';

export interface ProfileSubmissionsCardProps extends MCardProps {
  title: string;
  tooltip?: JSX.Element;
  itemsContent: JSX.Element;
}

const ProfileSubmissionsCard = ({ title, tooltip, itemsContent }: ProfileSubmissionsCardProps) => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCard className={classes.root} elevation={0} variant="outlined">
        <CardContent className={classes.content}>
          <h3 className={classes.title}>
            {title}
            {tooltip && tooltip}
          </h3>
          <div className={classes.itemsContainer}>{itemsContent}</div>
        </CardContent>
      </MCard>
    </ThemeProvider>
  );
};

export default ProfileSubmissionsCard;
