import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { CssBaseline, AppBarProps, AppBar } from '@material-ui/core';
import { useMediaQuery } from 'react-responsive';
import theme from '../../theme';
import useStyles from './header-styles';
import SearchInput from '../SearchInput';

export interface HeaderProps extends AppBarProps {
  title: string;
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  placeholder?: string;
}

function Header({ title, Icon, children, ...props }: HeaderProps) {
  const classes = useStyles();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar {...props}>
        <Toolbar>
          {Icon && (
            <a className={classes.headerIconContainer} href="/">
              <Icon />
            </a>
          )}

          <a className={classes.titleContainer} href="/">
            <Typography variant="h2" noWrap className={classes.title}>
              <>{title}</>
            </Typography>
          </a>
          <SearchInput
            className={classes.searchInput}
            fullWidth
            placeholder="Address, hash or number..."
          />
          <div
            className={
              isMobile
                ? [classes.sectionDesktop, classes.sectionDesktopMobile].join(' ')
                : classes.sectionDesktop
            }
          >
            {children}
          </div>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default Header;
