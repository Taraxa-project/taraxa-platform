import React from "react";
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { CircularProgress } from '@material-ui/core';
import theme from "../theme";
import '../app.scss';

export interface LoadingProps {

};

const Loading = ({ }: LoadingProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CircularProgress />
    </ThemeProvider>
  );
}

export default Loading;