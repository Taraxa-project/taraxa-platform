import React from 'react';
import {
  Card as MCard,
  CardProps as MCardProps,
  CardContent,
  Typography,
  Skeleton,
} from '@mui/material';
import useStyles from './BaseCard.styles';

export interface BaseCardProps extends MCardProps {
  title: string;
  description: string;
  tooltip?: JSX.Element;
  id?: string;
  button?: React.ReactNode;
  isLoading?: boolean;
}

const BaseCard = ({
  title,
  description,
  tooltip,
  id,
  button,
  isLoading = false,
}: BaseCardProps) => {
  const classes = useStyles();

  return (
    <MCard className={classes.root} id={id} elevation={0} variant='outlined'>
      <CardContent>
        <div className={classes.iconContainer}>
          {isLoading ? (
            <Skeleton variant='rectangular' height={45} width='100%' />
          ) : (
            <Typography
              color='primary'
              variant='h4'
              component='h4'
              fontWeight='700'
              fontSize='36px'
              className={classes.title}
            >
              {title}
            </Typography>
          )}
          {tooltip && <div className={classes.icon}>{tooltip}</div>}
        </div>
        <div className={classes.actionContainer}>
          <Typography
            className={classes.label}
            variant='body1'
            color='primary'
            fontSize='12px'
            textAlign='left'
            width='100%'
            mb={0}
            mt={2}
          >
            {description}
          </Typography>
          {button && button}
        </div>
      </CardContent>
    </MCard>
  );
};

export default BaseCard;
