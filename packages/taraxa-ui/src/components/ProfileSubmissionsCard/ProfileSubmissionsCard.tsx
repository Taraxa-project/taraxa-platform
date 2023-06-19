import React from 'react';
import {
  Card as MCard,
  CardProps as MCardProps,
  CardContent,
} from '@mui/material';
import useStyles from './ProfileSubmissionsCard.styles';

export interface ProfileSubmissionsCardProps extends MCardProps {
  title: string;
  tooltip?: JSX.Element;
  itemsContent: JSX.Element;
}

const ProfileSubmissionsCard = ({
  title,
  tooltip,
  itemsContent,
}: ProfileSubmissionsCardProps) => {
  const classes = useStyles();

  return (
    <MCard className={classes.root} elevation={0} variant='outlined'>
      <CardContent className={classes.content}>
        <h3 className={classes.title}>
          {title}
          {tooltip && tooltip}
        </h3>
        <div className={classes.itemsContainer}>{itemsContent}</div>
      </CardContent>
    </MCard>
  );
};

export default ProfileSubmissionsCard;
