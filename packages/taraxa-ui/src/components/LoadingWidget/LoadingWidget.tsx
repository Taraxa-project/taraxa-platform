import clsx from 'clsx';
import { useMediaQuery } from 'react-responsive';
import {
  Box,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
} from '@material-ui/core';
import theme from '../theme';

import useStyles from './loading-widget-styles';

export interface LoadingWidgetProps {
  isLoading: boolean;
  widgetId: string;
  progressId: string;
}

const LoadingWidget = ({ isLoading, widgetId, progressId }: LoadingWidgetProps) => {
  const classes = useStyles();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const rootClasses = clsx(
    classes.root,
    isLoading && classes.show,
    !isLoading && classes.hide,
    isMobile && classes.mobile,
    isMobile && 'mobile-loadingWidget',
    !isMobile && 'desktop-loadingWidget'
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box id={widgetId} className={rootClasses}>
        <CircularProgress id={progressId} size={35} thickness={4.5} className={classes.progress} /> Loading...
      </Box>
    </ThemeProvider>
  );
};

export default LoadingWidget;
