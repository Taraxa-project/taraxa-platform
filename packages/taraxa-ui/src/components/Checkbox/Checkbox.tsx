import React from "react";
import { Checkbox as MCheckbox, CssBaseline, ThemeProvider, CheckboxProps } from '@material-ui/core';
import theme from "../theme";

const Checkbox = ({ ...props }: CheckboxProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCheckbox {...props} />
    </ThemeProvider>
  );
};

export default Checkbox;