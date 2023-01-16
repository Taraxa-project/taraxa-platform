import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  CssBaseline,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  TextField,
  TextFieldProps,
  ThemeProvider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
  onClear?: () => void;
  className?: string;
  open?: boolean;
  options?: Option[];
  loading?: boolean;
  searchString?: string;
}

const SearchOption = ({
  type,
  label,
  onClick,
  ...props
}: {
  type: string;
  label: string;
  onClick: () => void;
  props?: React.HTMLAttributes<HTMLLIElement>;
}) => {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MenuItem
        onClick={onClick}
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
          style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            marginLeft: '10px',
          }}
        />
        <ListItemIcon classes={{ root: classes.listItemSecondaryRoot }}>
          <RightArrow />
        </ListItemIcon>
      </MenuItem>
    </ThemeProvider>
  );
};

interface AbsolutePaperProps {
  children?: React.ReactNode;
  classes: string;
  visibility: 'visible' | 'hidden' | 'collapse';
}

const AbsolutePaperWithRef = forwardRef<HTMLDivElement, AbsolutePaperProps>(
  ({ children, classes, visibility, ...props }, ref) => (
    <Paper ref={ref} className={classes} {...props} style={{ visibility }}>
      {children}
    </Paper>
  )
);

interface AbsoluteBoxWithRefProps {
  children?: React.ReactNode;
}

const AbsoluteBoxWithRef = forwardRef<HTMLDivElement, AbsoluteBoxWithRefProps>(
  ({ children, ...props }, ref) => (
    <Box ref={ref} {...props} width='100%'>
      {children}
    </Box>
  )
);

export type SearchTextFieldProps = {
  rootClass: string;
} & TextFieldProps;

const TextFieldWithRef = forwardRef<HTMLInputElement, SearchTextFieldProps>(
  ({ rootClass, ...props }, ref) => (
    <TextField
      {...props}
      classes={{
        root: rootClass,
      }}
      inputRef={ref}
    />
  )
);

const SearchInput = ({
  placeholder,
  fullWidth = false,
  loading = false,
  open = false,
  options = [],
  className,
  onChange,
  onInputChange,
  onClear,
  searchString,
}: SearchInputProps) => {
  const classes = useStyles();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const boxElementRef = useRef<HTMLDivElement>(null);
  const absoluteElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boxElementWidth = boxElementRef.current?.offsetWidth;
    if (boxElementWidth && absoluteElementRef.current) {
      absoluteElementRef.current.style.width = `${boxElementWidth}px`;
    }
  }, [window.innerWidth]);

  const handleOptionSelect = (value: Option | null) => {
    if (typeof onChange === 'function') onChange(value);
  };

  const handleInputChange = (value: string) => {
    if (typeof onInputChange === 'function') onInputChange(value);
  };

  const handleClear = () => {
    if (typeof onClear === 'function') onClear();
    searchInputRef.current!.value = '';
  };

  const debouncedResults = useMemo(() => {
    return debounce(handleInputChange, 50);
  }, []);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  }, [debouncedResults]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AbsoluteBoxWithRef ref={boxElementRef}>
        <TextFieldWithRef
          ref={searchInputRef}
          variant='outlined'
          type='text'
          name='search-field'
          fullWidth={fullWidth}
          className={className}
          rootClass={classes.input}
          placeholder={placeholder}
          onChange={(e) => debouncedResults(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment
                classes={{ root: classes.iconRoot }}
                position='start'
              >
                {loading ? <Loading size={28} color='#6A7085' /> : <Search />}
              </InputAdornment>
            ),
            endAdornment: searchString && (
              <InputAdornment position='end'>
                <IconButton onClick={handleClear} edge='end'>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <AbsolutePaperWithRef
          ref={absoluteElementRef}
          classes={classes.paper}
          visibility={open ? 'visible' : 'hidden'}
        >
          {open && (
            <MenuList>
              {options?.length > 0 ? (
                options.map((option: Option) => (
                  <SearchOption
                    onClick={() => {
                      handleOptionSelect(option);
                      handleClear();
                    }}
                    key={`${option.type}-${option.value}`}
                    type={option.type}
                    label={option.label}
                  />
                ))
              ) : (
                <MenuItem>
                  <NotFound /> Nothing found...
                </MenuItem>
              )}
            </MenuList>
          )}
        </AbsolutePaperWithRef>
      </AbsoluteBoxWithRef>
    </ThemeProvider>
  );
};

export default SearchInput;
