import React from 'react';
import {
  Card as MCard,
  CardProps as MCardProps,
  CssBaseline,
  ThemeProvider,
  Typography,
} from '@material-ui/core';
import { useMediaQuery } from 'react-responsive';
import theme from '../theme';
import useStyles from './linkedCards-styles';

export interface LinkedCardsProps extends MCardProps {
  approvedContent: JSX.Element;
  reviewContent: JSX.Element;
  rejectedContent: JSX.Element;
  approvedTooltip?: JSX.Element;
  reviewTooltip?: JSX.Element;
  rejectedTooltip?: JSX.Element;
}

const LinkedCards = ({
  approvedContent,
  reviewContent,
  rejectedContent,
  approvedTooltip,
  reviewTooltip,
  rejectedTooltip,
}: LinkedCardsProps) => {
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
        <MCard
          className={isMobile ? classes.mobileApprovedCard : classes.approvedCard}
          elevation={0}
        >
          {approvedTooltip && <div className={classes.tooltipIcon}>{approvedTooltip}</div>}
          <Typography variant="body1" color="primary">
            Approved
            {approvedContent}
          </Typography>
        </MCard>
        <MCard className={isMobile ? classes.mobileReviewCard : classes.reviewCard} elevation={0}>
          {reviewTooltip && <div className={classes.tooltipIcon}>{reviewTooltip}</div>}
          <Typography variant="body1" color="primary">
            In review
            {reviewContent}
          </Typography>
        </MCard>
        <MCard
          className={isMobile ? classes.mobileRejectedCard : classes.rejectedCard}
          elevation={0}
        >
          {rejectedTooltip && <div className={classes.tooltipIcon}>{rejectedTooltip}</div>}
          <Typography variant="body1" color="primary">
            Rejected
            {rejectedContent}
          </Typography>
        </MCard>
      </MCard>
    </ThemeProvider>
  );
};

export default LinkedCards;
