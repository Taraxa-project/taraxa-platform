import React from 'react';
import {
  Card as MCard,
  CardProps,
  CardContent,
  CssBaseline,
  ThemeProvider,
  Typography,
} from '@material-ui/core';
import theme from '../theme';
import Button from '../Button';
import useStyles from './verticalrewardcard-styles';
import { useMediaQuery } from 'react-responsive';

export interface VerticalRewardCardProps extends CardProps {
  description: string;
  reward: string;
  expiration?: string;
  submissions?: number;
  active?: boolean;
  onClickText: string;
  ExpirationIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  SubmissionIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  onClickButton?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  dataList?: JSX.Element;
}

const VerticalRewardCard = ({
  title,
  description,
  onClickButton,
  onClickText,
  reward,
  expiration,
  submissions,
  SubmissionIcon,
  ExpirationIcon,
  dataList,
  active,
}: VerticalRewardCardProps) => {
  const classes = useStyles();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCard
        className={isMobile ? classes.mobileRoot : classes.root}
        elevation={0}
        variant="outlined"
      >
        <CardContent className={classes.content}>
          <div className={classes.informationCard}>
            <div style={{ display: 'grid', gridTemplateColumns: '95% 5%' }}>
              <div style={{ gridColumn: 1 }}>
                <Typography variant="h5" color="primary" className={classes.infoData}>
                  {title}
                </Typography>
              </div>
              {active && (
                <span
                  style={{ gridColumn: 2 }}
                  className={isMobile ? classes.mobileDot : classes.dot}
                ></span>
              )}
            </div>

            <Typography variant="body2" color="primary" className={classes.infoData}>
              {description}
            </Typography>

            <div className={classes.bottomContent}>
              <div className={classes.iconContent}>
                {ExpirationIcon && <ExpirationIcon />}
                <Typography variant="body2" color="textSecondary" style={{ marginLeft: '5%' }}>
                  {expiration}
                </Typography>
              </div>
              <div className={classes.iconContent}>
                {SubmissionIcon && <SubmissionIcon />}
                <Typography variant="body2" color="textSecondary" style={{ marginLeft: '5%' }}>
                  {submissions} submissions
                </Typography>
              </div>
            </div>
          </div>
          <div className={classes.actionCard}>
            <Typography color="primary" variant="body1" className={classes.infoData}>
              Reward:
            </Typography>
            <div className={classes.rewardContent}>{reward}</div>
            <Button
              disableElevation
              color="secondary"
              onClick={onClickButton}
              variant="contained"
              label={onClickText}
              size="medium"
              className={classes.button}
            ></Button>
          </div>
          {dataList && <div className={classes.dataListContainer}>{dataList}</div>}
        </CardContent>
      </MCard>
    </ThemeProvider>
  );
};

export default VerticalRewardCard;
