import React from 'react';
import useStyles from './InfoCard.styles';

interface InfoCardProps {
  title: string;
  description: string;
}

const InfoCard = ({ title, description }: InfoCardProps) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <p className={classes.title}>{title}</p>
      <p className={classes.description}>{description}</p>
    </div>
  );
};

export default InfoCard;
