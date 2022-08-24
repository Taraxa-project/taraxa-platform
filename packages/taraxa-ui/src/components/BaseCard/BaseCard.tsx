import React from 'react';
import {
  Card as MCard,
  CardProps as MCardProps,
  CardContent,
  CssBaseline,
  Typography,
  ThemeProvider,
} from '@mui/material';
import theme from '../theme';
import useStyles from './BaseCard.styles';

export interface BaseCardProps extends MCardProps {
  title: string;
  description: string;
  tooltip?: JSX.Element;
  id?: string;
  button?: React.ReactNode;
}

const BaseCard = ({
  title,
  description,
  tooltip,
  id,
  button,
}: BaseCardProps) => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCard className={classes.root} id={id} elevation={0} variant='outlined'>
        <CardContent>
          <div className={classes.iconContainer}>
            <Typography
              color='primary'
              variant='h4'
              component='h4'
              className={classes.title}
            >
              {title}
            </Typography>
            {tooltip && <div className={classes.icon}>{tooltip}</div>}
          </div>
          <div className={classes.actionContainer}>
            <Typography
              className={classes.label}
              variant='body1'
              color='primary'
            >
              {description}
            </Typography>
            {button && button}
          </div>
        </CardContent>
      </MCard>
    </ThemeProvider>
  );
};

export default BaseCard;
