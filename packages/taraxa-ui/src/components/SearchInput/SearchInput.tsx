import React, { ChangeEvent, useEffect, useMemo } from 'react';
import {
  CssBaseline,
  InputAdornment,
  InputBase,
  ListItem,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import debounce from 'lodash.debounce';
import useStyles from './SearchInput.styles';
import { Search, RightArrow, NotFound } from '../Icons';
import Loading from '../Loading';
import theme from '../theme';

export interface Option {
  type: string;
  label: string;
  value: string;
}

export interface SearchInputProps {
  placeholder?: string;
  fullWidth?: boolean;
  onChange?: (value: Option | null) => void;
  onInputChange?: (value: string) => void;
  className?: string;
  open?: boolean;
  options?: Option[];
  loading?: boolean;
}

const SearchOption = ({
  type,
  label,
  ...props
}: {
  type: string;
  label: string;
  props?: React.HTMLAttributes<HTMLLIElement>;
}) => {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ListItem
        disableGutters
        classes={{
          root: classes.listItem,
        }}
        {...props}
      >
        <ListItemText
          inset
          classes={{
            primary: classes.listItemPrimary,
            secondary: classes.listItemSecondary,
            root: classes.listItemTextRoot,
          }}
          primary={`${type}:`}
          secondary={label}
        />
        <ListItemIcon classes={{ root: classes.listItemSecondaryRoot }}>
          <RightArrow />
        </ListItemIcon>
      </ListItem>
    </ThemeProvider>
  );
};

const SearchInput = ({
  placeholder,
  fullWidth = false,
  loading = false,
  open = false,
  options = [],
  className,
  onChange,
  onInputChange,
}: SearchInputProps) => {
  const classes = useStyles();

  const handleOptionSelect = (
    event: ChangeEvent<any>,
    value: Option | null
  ) => {
    // eslint-disable-next-line no-console
    if (typeof onChange === 'function') onChange(value);
  };

  const handleInputChange = (value: string) => {
    // eslint-disable-next-line no-console
    if (typeof onInputChange === 'function') onInputChange(value);
  };

  const debouncedResults = useMemo(() => {
    return debounce(handleInputChange, 300);
  }, []);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  }, [debouncedResults]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Autocomplete
        open={open}
        options={options}
        loading={loading}
        fullWidth={fullWidth}
        onChange={(e, value) => handleOptionSelect(e, value)}
        classes={{
          loading: classes.loading,
          paper: classes.paper,
          listbox: classes.listBox,
          option: classes.option,
          noOptions: classes.noOptions,
        }}
        loadingText={<Loading size={28} color='#6A7085' />}
        noOptionsText={
          <>
            <NotFound /> Nothing found...
          </>
        }
        renderOption={(props, option) => (
          <SearchOption type={option.type} label={option.label} {...props} />
        )}
        getOptionLabel={(option) => option.label}
        renderInput={(params) => {
          return (
            <InputBase
              ref={params.InputProps.ref}
              inputProps={params.inputProps}
              fullWidth={fullWidth}
              className={className}
              placeholder={placeholder}
              // onChange={debouncedResults}
              // onChange={(e) => handleInputChange(e.target.value)}
              onChange={(e) => debouncedResults(e.target.value)}
              startAdornment={
                <InputAdornment
                  classes={{ root: classes.iconRoot }}
                  position='start'
                >
                  <Search />
                </InputAdornment>
              }
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              id={params.id}
            />
          );
        }}
      />
    </ThemeProvider>
  );
};

export default SearchInput;
