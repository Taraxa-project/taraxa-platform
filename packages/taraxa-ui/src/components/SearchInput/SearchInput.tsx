import React, { ChangeEvent } from 'react';
import {
  InputAdornment,
  InputBase,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import useStyles from './SearchInput.styles';
import { Search, RightArrow, NotFound } from '../Icons';
import Loading from '../Loading';

export interface Option {
  type: string;
  label: string;
  value: string;
}

export interface SearchInputProps {
  placeholder?: string;
  fullWidth?: boolean;
  onChange?: (value: Option) => any;
  className?: string;
  open?: boolean;
  options?: Option[];
  loading?: boolean;
}

const SearchOption = ({ type, label }: { type: string; label: string }) => {
  const classes = useStyles();
  return (
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
}: SearchInputProps) => {
  const classes = useStyles();

  const onInputChange = (event: ChangeEvent<any>, value: Option) => {
    event.preventDefault();
    if (typeof onChange === 'function') onChange(value);
  };

  return (
    <Autocomplete
      open={open}
      options={options}
      loading={loading}
      fullWidth={fullWidth}
      onChange={(e, value) => onInputChange(e, value)}
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
  );
};

export default SearchInput;
