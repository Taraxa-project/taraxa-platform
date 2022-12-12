import React from 'react';
import {
  AppBar,
  AppBarProps,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
  ThemeProvider,
  Box,
  Breakpoint,
  Link,
  StyledEngineProvider,
} from '@mui/material';
import { useMediaQuery } from 'react-responsive';
import theme from '../theme';
import { useHeaderStyles } from './Header.styles';
import SearchInput from '../SearchInput';
import { SearchInputProps } from '../SearchInput/SearchInput';

export interface HeaderProps extends AppBarProps {
  title: string;
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  searchPlaceholder?: string;
  withSearch?: boolean;
  searchInputProps?: SearchInputProps;
  maxWidth?: Breakpoint;
}

function Header({
  title,
  Icon,
  children,
  maxWidth,
  withSearch = false,
  searchInputProps,
  searchPlaceholder = 'Hash or number...',
  ...props
}: HeaderProps) {
  const classes = useHeaderStyles();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar {...props} variant='elevation'>
          <Container maxWidth={maxWidth || false}>
            <Toolbar variant='regular'>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {Icon && (
                  <Link
                    className={classes.headerIconLink}
                    href='/'
                    underline='none'
                  >
                    <Icon />
                  </Link>
                )}

                <Link className={classes.titleLink} href='/' underline='none'>
                  <Typography variant='h2' noWrap className={classes.titleText}>
                    {title}
                  </Typography>
                </Link>
              </Box>
              {withSearch && (
                <SearchInput
                  className={classes.searchInput}
                  fullWidth
                  {...searchInputProps}
                  placeholder={searchPlaceholder}
                />
              )}
              <div
                className={
                  isMobile
                    ? [
                        classes.sectionDesktop,
                        classes.sectionDesktopMobile,
                      ].join(' ')
                    : classes.sectionDesktop
                }
              >
                {children}
              </div>
            </Toolbar>
          </Container>
        </AppBar>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default Header;
