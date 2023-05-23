import React from 'react';
import {
  AppBar,
  AppBarProps,
  Container,
  Toolbar,
  Typography,
  Box,
  Breakpoint,
  Link,
  StyledEngineProvider,
} from '@mui/material';
import { useMediaQuery } from 'react-responsive';
import { useHeaderStyles } from './Header.styles';

export interface HeaderProps extends AppBarProps {
  title: string;
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  maxWidth?: Breakpoint;
}

function Header({ title, Icon, children, maxWidth, ...props }: HeaderProps) {
  const classes = useHeaderStyles();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  return (
    <StyledEngineProvider>
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
    </StyledEngineProvider>
  );
}

export default Header;
