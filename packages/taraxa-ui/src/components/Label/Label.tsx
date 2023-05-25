import React from 'react';
import useStyles from './Label.styles';

export interface LabelProps {
  variant: 'success' | 'error' | 'secondary' | 'loading';
  label: string;
  icon: JSX.Element;
  gap?: boolean;
}

const Label = (props: LabelProps) => {
  const classes = useStyles();
  const { label, variant, icon, gap } = props;
  return (
    <div className={gap ? classes.gappedContainer : classes.container}>
      {icon}
      <div className={classes[variant]}>{label}</div>
    </div>
  );
};

export default Label;
