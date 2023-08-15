import React from 'react';
import useStyles from './ProgressBar.styles';
import theme from '../theme';

export interface ProgressBarCellProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarCellProps> = ({ percentage }) => {
  const classes = useStyles();
  return (
    <div className={classes.cellContainer}>
      <p className={classes.percentageText}>{percentage}%</p>
      <div className={classes.progressBar}>
        <div
          style={{
            width: `${percentage}%`,
            backgroundColor: theme.palette.secondary.main,
            height: '100%',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
