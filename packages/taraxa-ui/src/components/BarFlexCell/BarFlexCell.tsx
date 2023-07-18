import React from 'react';
import useStyles, { BarFlexCellProps } from './BarFlexCell.styles';

const BarFlexCell: React.FC<BarFlexCellProps> = ({ percentage }) => {
  const classes = useStyles(percentage);
  return (
    <div className={classes.cellContainer}>
      <span className={classes.percentageText}>{percentage}%</span>
      <div className={classes.progressBar} />
      <div className={classes.greyBar} />
    </div>
  );
};

export default BarFlexCell;
