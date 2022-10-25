import React, { useMediaQuery } from 'react-responsive';
import clsx from 'clsx';
import {
  Box,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import theme from '../theme';

import useStyles from './LoadingWidget.styles';

export interface LoadingWidgetProps {
  isLoading: boolean;
  widgetId: string;
  progressId: string;
}

const LoadingWidget = ({
  isLoading,
  widgetId,
  progressId,
}: LoadingWidgetProps) => {
  const classes = useStyles();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const rootClasses = clsx(
    classes.root,
    isLoading ? classes.show : classes.hide,
    isMobile
      ? [classes.mobile, 'mobile-loadingWidget']
      : 'desktop-loadingWidget'
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        id={widgetId}
        className={rootClasses}
        display='flex'
        alignItems='center'
        justifyContent='center'
        alignContent='center'
      >
        <CircularProgress
          id={progressId}
          size={35}
          thickness={4.5}
          className={classes.progress}
        />{' '}
        <p style={{ marginLeft: '1rem' }}>Loading...</p>
      </Box>
    </ThemeProvider>
  );
};

export default LoadingWidget;
