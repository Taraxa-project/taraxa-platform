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
import Jdenticon from 'jdenticon';

import theme from '../theme';

import useStyles from './profilecard-styles';

export interface ProfileCardProps extends MCardProps {
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  username: string;
  email: string;
  wallet?: string;
  buttonOptions?: JSX.Element;
}

const ProfileCard = ({ Icon, username, email, wallet, buttonOptions }: ProfileCardProps) => {
  const classes = useStyles();
  const profileIcon = Jdenticon.toSvg(email, 47, { backColor: '#fff' });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCard className={classes.root} elevation={0} variant="outlined">
        <div className={classes.userDetails}>
          {Icon && (
            <div
              className={classes.iconContainer}
              // eslint-disable-next-line
              dangerouslySetInnerHTML={{ __html: profileIcon }}
            />
          )}
          <Typography variant="body1" className={classes.label} color="primary">
            {username}
          </Typography>
          <Typography variant="body2" className={classes.label} color="textSecondary">
            {email}
          </Typography>
        </div>
        <CardContent className={classes.content}>
          {wallet && (
            <>
              <Typography variant="body2" className={classes.label} color="textSecondary">
                TARA address (ERC20):
              </Typography>
              <Typography variant="body1" className={classes.label} color="primary">
                {wallet}
              </Typography>
            </>
          )}
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

export default ProfileCard;
