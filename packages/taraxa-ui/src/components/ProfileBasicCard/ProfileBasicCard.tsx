import React from 'react';
import {
  Card as MCard,
  CardProps as MCardProps,
  CardContent,
  CardActions,
  CssBaseline,
  ThemeProvider,
  Typography,
} from '@material-ui/core';

import theme from '../theme';

import useStyles from './profilebasiccard-styles';

export interface ProfileBasicCardProps extends MCardProps {
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  title: string;
  value?: string;
  description?: string;
  buttonOptions?: JSX.Element;
}

const ProfileBasicCard = ({
  Icon,
  title,
  value,
  description,
  buttonOptions,
  children,
}: ProfileBasicCardProps) => {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCard className={classes.root} elevation={0} variant="outlined">
        {Icon && (
          <Typography variant="body1" className={classes.label} color="primary">
            <div className={classes.iconContainer}>
              <div className={classes.icon}>
                <Icon />
              </div>
              {title}
            </div>
          </Typography>
        )}
        {!Icon && (
          <Typography variant="body1" className={classes.label} color="primary">
            {title}
          </Typography>
        )}
        <CardContent className={classes.content}>
          {value && (
            <Typography variant="h4" className={classes.value} color="primary">
              {value}
            </Typography>
          )}
          {children}
          <Typography variant="body1" className={classes.description} color="textSecondary">
            {description}
          </Typography>
        </CardContent>
        {buttonOptions && (
          <CardActions className={classes.actions} disableSpacing>
            {buttonOptions}
          </CardActions>
        )}
      </MCard>
    </ThemeProvider>
  );
};

export default ProfileBasicCard;
