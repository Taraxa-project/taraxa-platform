import React from 'react';
import useStyles from './amountcard-styles';

interface AmountCardProps {
  amount: string;
  unit: string;
}

const AmountCard = ({ amount, unit }: AmountCardProps) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <p className={classes.amount}>{amount}</p>
      <p className={classes.unit}>{unit}</p>
    </div>
  );
};

export default AmountCard;
