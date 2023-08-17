import React from 'react';
import Text from '../Text';
import { Exclamation } from '../Icons';
import useStyles from './Notification.styles';

export interface NotificationProps {
  title?: string;
  text?: string;
  variant?: 'success' | 'danger' | 'info';
}

const Notification = ({
  title,
  text,
  variant,
  children,
}: React.PropsWithChildren<NotificationProps>) => {
  const classes = useStyles();
  let containerStyle = classes.container;
  let iconColor = '#E96828';

  if (variant) {
    if (variant === 'success') {
      containerStyle += ` ${classes.success}`;
      iconColor = '#15AC5B';
    }
    if (variant === 'danger') {
      containerStyle += ` ${classes.danger}`;
      iconColor = '#FF515A';
    }
    if (variant === 'info') {
      containerStyle += ` ${classes.info}`;
      iconColor = '#48BDFF';
    }
  }

  return (
    <div className={containerStyle}>
      <div className={classes.icon}>
        <Exclamation color={iconColor} />
      </div>
      <div>
        {title && (
          <Text
            label={title}
            variant='body1'
            color='primary'
            fontWeight='700'
            fontSize='16px'
            className={classes.title}
          />
        )}
        {text && (
          <Text
            label={text}
            variant='body2'
            color='primary'
            className={classes.text}
          />
        )}
        {children && (
          <div className={classes.childrenContainer}>{children}</div>
        )}
      </div>
    </div>
  );
};

export default Notification;
