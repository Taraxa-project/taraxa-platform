import React from 'react';
import {
  AppBar,
  AppBarProps,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
  ThemeProvider,
} from '@mui/material';
import { useMediaQuery } from 'react-responsive';
import theme from '../theme';
import useStyles from './Header.styles';
import SearchInput from '../SearchInput';

export interface HeaderProps extends AppBarProps {
  title: string;
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  searchPlaceholder?: string;
  withSearch?: boolean;
}

function Header({
  title,
  Icon,
  children,
  withSearch = false,
  searchPlaceholder = 'Address, hash or number...',
  ...props
}: HeaderProps) {
  const classes = useStyles();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar {...props} variant='elevation'>
        <Container maxWidth={false}>
          <Toolbar variant='regular'>
            {Icon && (
              <a className={classes.headerIconContainer} href='/'>
                <Icon />
              </a>
            )}

            <a className={classes.titleContainer} href='/'>
              <Typography variant='h2' noWrap className={classes.title}>
                <>{title}</>
              </Typography>
            </a>
            {withSearch && (
              <SearchInput
                className={classes.searchInput}
                fullWidth
                placeholder={searchPlaceholder}
              />
            )}
            <div
              className={
                isMobile
                  ? [classes.sectionDesktop, classes.sectionDesktopMobile].join(
                      ' '
                    )
                  : classes.sectionDesktop
              }
            >
              {children}
            </div>
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
}

export default Header;
