import React from 'react';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import Text from '../Text';

import theme from '../theme';

import useStyles from './notification-styles';

export interface NotificationProps {
  title: string;
  text: string;
  variant?: 'success' | 'danger';
  style?: React.CSSProperties | undefined;
}

const Notification = ({ title, text, variant, style }: NotificationProps) => {
  const classes = useStyles();
  let containerStyle = classes.container;

  if (variant) {
    if (variant === 'success') {
      containerStyle += ` ${classes.success}`;
    }
    if (variant === 'danger') {
      containerStyle += ` ${classes.danger}`;
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={containerStyle} style={style}>
        <Text label={title} variant="body1" color="primary" className={classes.title} />
        <Text label={text} variant="body2" color="primary" className={classes.text} />
      </div>
    </ThemeProvider>
  );
};

export default Notification;
