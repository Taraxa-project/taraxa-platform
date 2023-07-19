import React from 'react';
import useStyles, { BarFlexCellProps } from './BarFlexCell.styles';
import theme from '../theme';

const BarFlexCell: React.FC<BarFlexCellProps> = ({ percentage }) => {
  const classes = useStyles();
  return (
    <div className={classes.cellContainer}>
      <span className={classes.percentageText}>{percentage}%</span>
      <div className={classes.barFlex}>
        <div
          className={classes.percentageAmount}
          style={{
            width: `${Math.max(percentage, 1)}%`,
          }}
        >
          <div
            className={classes.barPercentage}
            style={{ background: theme.palette.secondary.main }}
          />
        </div>
        <div
          className={classes.percentageAmount}
          style={{
            width: `${100 - percentage}%`,
          }}
        >
          <div className={classes.barPercentage} />
        </div>
      </div>
    </div>
  );
};

export default BarFlexCell;
