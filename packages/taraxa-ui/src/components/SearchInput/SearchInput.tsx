import React, { ChangeEvent } from 'react';
import {
  CssBaseline,
  InputAdornment,
  InputBase,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  ThemeProvider,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
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

const SearchOption = ({ type, label }: { type: string; label: string }) => {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ListItem
        ContainerComponent="div"
        disableGutters
        classes={{ container: classes.listItemContainer, root: classes.listItem }}
        dense
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
        <ListItemSecondaryAction classes={{ root: classes.listItemSecondaryRoot }}>
          <RightArrow />
        </ListItemSecondaryAction>
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

  const handleOptionSelect = (event: ChangeEvent<any>, value: Option | null) => {
    event.preventDefault();
    if (typeof onChange === 'function') onChange(value);
  };

  const handleInputChange = (value: string) => {
    if (typeof onInputChange === 'function') onInputChange(value);
  };

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
        loadingText={<Loading size={28} color="#6A7085" />}
        noOptionsText={
          <>
            <NotFound /> Nothing found...
          </>
        }
        renderOption={(option) => <SearchOption type={option.type} label={option.label} />}
        getOptionLabel={(option) => option.label}
        renderInput={(params) => {
          return (
            <InputBase
              ref={params.InputProps.ref}
              inputProps={params.inputProps}
              fullWidth={fullWidth}
              className={className}
              placeholder={placeholder}
              onChange={(e) => handleInputChange(e.target.value)}
              startAdornment={
                <InputAdornment classes={{ root: classes.iconRoot }} position="start">
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
