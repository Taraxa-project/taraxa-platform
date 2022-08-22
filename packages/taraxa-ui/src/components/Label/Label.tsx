import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import theme from '../theme';
import useStyles from './Label.styles';

export interface LabelProps {
  variant: 'success' | 'error' | 'secondary';
  label: string;
  icon: JSX.Element;
}

const Label = (props: LabelProps) => {
  const classes = useStyles();
  const { label, variant, icon } = props;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.container}>
        {icon}
        <div className={classes[variant]}>{label}</div>
      </div>
    </ThemeProvider>
  );
};

export default Label;
