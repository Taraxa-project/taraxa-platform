import React from 'react';
import useStyles from './InfoCard.styles';

interface InfoCardProps {
  title: string;
  subtitle?: string;
  description?: string;
}

const InfoCard = ({ title, subtitle, description }: InfoCardProps) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <p className={classes.title}>{title}</p>
      {subtitle && <p className={classes.subtitle}>{subtitle}</p>}
      {description && <p className={classes.description}>{description}</p>}
    </div>
  );
};

export default InfoCard;
