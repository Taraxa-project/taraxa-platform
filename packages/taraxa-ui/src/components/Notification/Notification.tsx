import React from 'react';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import Text from '../Text';

import theme from '../theme';

import useStyles from './notification-styles';

export interface NotificationProps {
  title?: string;
  text?: string;
  variant?: 'success' | 'danger';
}

const Notification = ({
  title,
  text,
  variant,
  children,
}: React.PropsWithChildren<NotificationProps>) => {
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
      <div className={containerStyle}>
        {title && <Text label={title} variant="body1" color="primary" className={classes.title} />}
        {text && <Text label={text} variant="body2" color="primary" className={classes.text} />}
        {children && (
          <Text variant="body2" color="primary" className={classes.text}>
            {children}
          </Text>
        )}
      </div>
    </ThemeProvider>
  );
};

export default Notification;
