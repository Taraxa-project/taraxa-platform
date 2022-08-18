import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import theme from '../theme';
import useStyles from './Label.styles';

export interface LabelProps {
  variant: 'success' | 'error' | 'secondary';
  label: string;
  Icon: JSX.Element;
}

const Label = (props: LabelProps) => {
  const classes = useStyles();
  const { label, variant, Icon } = props;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.container}>
        {Icon}
        <div className={classes[variant]}>{label}</div>
      </div>
    </ThemeProvider>
  );
};

export default Label;
