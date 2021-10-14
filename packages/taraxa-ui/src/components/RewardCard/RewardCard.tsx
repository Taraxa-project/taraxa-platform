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
import useStyles from './rewardcard-styles';

export interface RewardCardProps extends CardProps {
  description: string;
  reward: string;
  expiration?: string;
  submissions?: number;
  onClickText: string;
  ExpirationIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  SubmissionIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  onClickButton?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  dataList?: JSX.Element;
}

const RewardCard = ({
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
}: RewardCardProps) => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCard className={classes.root} elevation={0} variant="outlined">
        <CardContent className={classes.content}>
          <div className={classes.informationCard}>
            <Typography variant="h5" color="primary" className={classes.infoData}>
              {title}
              <span className={classes.dot}></span>
            </Typography>

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

export default RewardCard;
