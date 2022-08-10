import React, { useState } from 'react';
import { InputAdornment, InputBase } from '@material-ui/core';
import useStyles from './SearchInput.styles';
import { Search } from '../Icons';

export interface SearchInputProps {
  placeholder?: string;
  fullWidth?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => any;
  className?: string;
}

const SearchInput = ({ placeholder, fullWidth = false, className, onChange }: SearchInputProps) => {
  const classes = useStyles();
  const [value, setValue] = useState('');

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setValue(e.target.value);
    if (typeof onChange === 'function') onChange(e);
  };
  return (
    <InputBase
      className={className}
      placeholder={placeholder}
      fullWidth={fullWidth}
      startAdornment={
        <InputAdornment classes={{ root: classes.iconRoot }} position="start">
          <Search />
        </InputAdornment>
      }
      classes={{
        root: classes.inputRoot,
        input: classes.inputInput,
      }}
      value={value}
      onChange={onInputChange}
      inputProps={{ 'aria-label': 'search' }}
    />
  );
};

export default SearchInput;
