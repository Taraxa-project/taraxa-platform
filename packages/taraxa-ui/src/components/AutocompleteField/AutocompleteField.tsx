import React from 'react';
import {
  CssBaseline,
  ThemeProvider,
  Autocomplete,
  AutocompleteProps,
} from '@mui/material';
import theme from '../theme';
import useStyles from './AutocompleteField.styles';

interface AutocompleteOption {
  label: string;
  id: string | number;
}

export interface AutocompleteFieldProps<AutocompleteOption>
  extends AutocompleteProps<AutocompleteOption, false, false, false> {
  id?: string;
  error?: boolean;
  helperText?: string;
}

const AutocompleteField = ({
  id,
  options,
  ...props
}: AutocompleteFieldProps<AutocompleteOption>) => {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Autocomplete
        {...props}
        disablePortal
        options={options}
        isOptionEqualToValue={(option, value) => option.label === value.label}
        id={id || 'mui-autocomplete'}
        className={classes.autocomplete}
      />
    </ThemeProvider>
  );
};

export default AutocompleteField;
