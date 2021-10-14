import React from 'react';
import MSnackbar, { SnackbarProps as MSnackbarProps } from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import './snackbar-styles.scss';

export interface SnackbarProps extends MSnackbarProps {
  severity: 'success' | 'warning' | 'error' | 'info';
  message: string;
  onSnackbarClose: ((event: React.SyntheticEvent<Element, Event>) => void) | undefined;
}

const Snackbar = ({
  severity,
  open,
  autoHideDuration,
  message,
  onSnackbarClose,
}: SnackbarProps) => {
  return (
    <MSnackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      autoHideDuration={autoHideDuration ? autoHideDuration : 2000}
      onClose={onSnackbarClose}
    >
      <Alert severity={severity} onClose={onSnackbarClose}>
        {message}
      </Alert>
    </MSnackbar>
  );
};

export default Snackbar;
