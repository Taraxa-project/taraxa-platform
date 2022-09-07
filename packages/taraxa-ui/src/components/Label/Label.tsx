import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import theme from '../theme';
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={gap ? classes.gappedContainer : classes.container}>
        {icon}
        <div className={classes[variant]}>{label}</div>
      </div>
    </ThemeProvider>
  );
};

export default Label;
