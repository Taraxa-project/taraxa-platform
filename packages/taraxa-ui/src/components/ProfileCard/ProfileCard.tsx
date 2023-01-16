import React from 'react';
import {
  Card as MCard,
  CardProps as MCardProps,
  CardContent,
  CardActions,
  CssBaseline,
  ThemeProvider,
  Typography,
  Box,
} from '@mui/material';
import { toSvg } from 'jdenticon';

import theme from '../theme';

import ExcalamtionTriangle from '../Icons/ExclamationTriangle';
import useStyles from './ProfileCard.styles';

export interface ProfileCardProps extends MCardProps {
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  username: string;
  email: string;
  wallet?: string;
  addressWarning?: boolean;
  buttonOptions?: JSX.Element;
}

const ProfileCard = ({
  Icon,
  username,
  email,
  wallet,
  addressWarning,
  buttonOptions,
}: ProfileCardProps) => {
  const classes = useStyles();
  const profileIcon = toSvg(email, 47, { backColor: '#fff' });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCard className={classes.root} elevation={0} variant='outlined'>
        <div className={classes.userDetails}>
          {Icon && (
            <div
              className={classes.iconContainer}
              // eslint-disable-next-line
              dangerouslySetInnerHTML={{ __html: profileIcon }}
            />
          )}
          <Box sx={{ flexDirection: 'column' }}>
            <Typography
              variant='body1'
              className={classes.label}
              color='primary'
            >
              {username}
            </Typography>
            <Typography
              variant='body2'
              className={classes.label}
              color='textSecondary'
            >
              {email}
            </Typography>
          </Box>
        </div>
        <CardContent className={classes.content}>
          {wallet && (
            <>
              <Typography
                variant='body2'
                className={classes.label}
                color='textSecondary'
              >
                {addressWarning ? (
                  <>
                    TARA address (ERC20):{' '}
                    <ExcalamtionTriangle color='#E96828' />{' '}
                  </>
                ) : (
                  `TARA address (ERC20):`
                )}
              </Typography>
              <Typography
                variant='body1'
                className={classes.label}
                color='primary'
              >
                {addressWarning ? (
                  <>
                    {wallet}
                    <span style={{ color: '#E96828' }}>(not authorized)</span>
                  </>
                ) : (
                  wallet
                )}
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
