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
  value?: string;
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

const AbsolutePaper: React.ForwardRefRenderFunction<
  HTMLDivElement,
  AbsolutePaperProps
> = ({ children, classes, visibility, ...props }, ref) => {
  return (
    <Paper ref={ref} className={classes} {...props} style={{ visibility }}>
      {children}
    </Paper>
  );
};

const AbsolutePaperWithRef = forwardRef(AbsolutePaper);

export type SearchTextFieldProps = {
  rootClass: string;
} & TextFieldProps;

const CustomInputField: React.ForwardRefRenderFunction<
  HTMLInputElement,
  SearchTextFieldProps
> = ({ rootClass, ...props }, ref) => {
  return (
    <TextField
      ref={ref}
      {...props}
      classes={{
        root: rootClass,
      }}
    />
  );
};

const CustomInputFieldWithRef = forwardRef(CustomInputField);

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
  value,
}: SearchInputProps) => {
  const classes = useStyles();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const absoluteElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchInputWidth = searchInputRef.current?.offsetWidth;
    if (searchInputWidth && absoluteElementRef.current) {
      absoluteElementRef.current.style.width = `${searchInputWidth}px`;
    }
  }, [window.innerWidth]);

  const handleOptionSelect = (value: Option | null) => {
    if (typeof onChange === 'function') onChange(value);
  };

  const handleInputChange = (value: string) => {
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
      <Box width='100%'>
        <CustomInputFieldWithRef
          ref={searchInputRef}
          variant='outlined'
          type='text'
          fullWidth={fullWidth}
          className={className}
          rootClass={classes.input}
          placeholder={placeholder}
          value={value || ''}
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
            endAdornment: value && (
              <InputAdornment position='end'>
                <IconButton onClick={onClear} edge='end'>
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
          // style={{ visibility: open ? 'visible' : 'hidden' }}
        >
          {open && (
            <MenuList>
              {options?.length > 0 ? (
                options.map((option: Option) => (
                  <SearchOption
                    onClick={() => handleOptionSelect(option)}
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
      </Box>
    </ThemeProvider>
  );
};

export default SearchInput;
