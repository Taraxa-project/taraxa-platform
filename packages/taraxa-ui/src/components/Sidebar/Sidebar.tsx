import React from 'react';
import { useMediaQuery } from 'react-responsive';
import {
  createStyles,
  CssBaseline,
  Drawer,
  DrawerProps,
  List,
  makeStyles,
  Theme,
  ThemeProvider,
} from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import Text from '../Text';

import theme from '../theme';

import '../app.scss';

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      height: '100%',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      display: 'flex',
      width: drawerWidth,
      position: 'inherit',
      backgroundColor: '#151823 !important',
      '& > div:first-child': {
        flex: 1,
      },
      '& > div:last-child': {
        padding: '64px 0',
      },
    },
    drawerPaperMobile: {
      '& > div:last-child': {
        display: 'none',
      },
    },
    drawerContainer: {
      overflow: 'auto',
      backgroundColor: '#151823',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      backgroundColor: '#151823',
    },
  }),
);

interface SidebarItemProps {
  label?: string;
  name?: string;
  depthStep: number;
  depth: number;
  subItem: boolean;
  items: {
    label?: string;
    name?: string;
    Link?: JSX.Element;
    items?: { label?: string; name?: string; Link?: JSX.Element }[];
  }[];
  Link?: JSX.Element;
}

const SidebarItem = ({ label, items, depthStep, depth, subItem, Link, name }: SidebarItemProps) => {
  const pathname =
    window.location.pathname.length > 1
      ? window.location.pathname.substring(1)
      : window.location.pathname;

  const className = [];

  let isOpen = false;

  if (name === 'dashboard' && pathname === '/') {
    isOpen = true;
  }

  if (name === pathname || pathname.substring(0, name?.length || 0) === name?.toLocaleLowerCase()) {
    isOpen = true;
  }

  if (subItem || items.length < 1) {
    className.push(isOpen ? 'subItemOpened' : 'subItem');
  } else {
    className.push(isOpen ? 'itemOpened' : 'item');
  }

  return (
    <>
      <ListItem className={className.join(' ')} button dense>
        {Link ? (
          <ListItemText
            primary={Link}
            style={{
              paddingLeft: subItem ? depth * depthStep : !items ? (depth + 2) * depthStep : 15,
              marginTop: 0,
              marginBottom: 0,
            }}
          />
        ) : (
          <>
            <ListItemText
              primary={<div className="label">{label}</div>}
              style={{ paddingLeft: subItem ? depth * depthStep : 15 }}
            />
          </>
        )}
      </ListItem>
      {Array.isArray(items) ? (
        <List disablePadding dense>
          {items.map((subItem, index) => (
            <SidebarItem
              key={`${subItem.label}${index}`}
              depth={depth + 2}
              depthStep={depthStep}
              subItem
              label={subItem.label}
              items={subItem.items ? subItem.items : []}
              Link={subItem.Link ? subItem.Link : undefined}
              name={subItem.name ? subItem.name : undefined}
            />
          ))}
        </List>
      ) : null}
    </>
  );
};

export interface SidebarProps extends DrawerProps {
  disablePadding?: boolean;
  dense?: boolean;
  depthStep?: 0;
  depth?: 0;
  className?: string;
  children?: JSX.Element | false | Array<JSX.Element | false>;
  items: {
    label?: string;
    name?: string;
    Link?: JSX.Element;
    items?: { label?: string; name?: string; Link?: JSX.Element }[];
  }[];
}

const Sidebar = ({
  disablePadding,
  dense,
  depthStep,
  depth,
  items,
  className,
  children,
  ...props
}: SidebarProps) => {
  const classes = useStyles();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  let paperClasses = [classes.drawerPaper];

  if (isMobile) {
    paperClasses = [...paperClasses, classes.drawerPaperMobile];
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Drawer
        className="sidebar"
        variant={!isMobile ? 'permanent' : 'temporary'}
        classes={{ paper: paperClasses.join(' ') }}
        anchor={isMobile ? 'right' : 'left'}
        elevation={0}
        {...props}
      >
        <div>
          <List
            disablePadding={disablePadding}
            dense={dense}
            id="sidebarList"
            className={className || ''}
          >
            {items.map((sidebarItem, index) => (
              <SidebarItem
                key={`${sidebarItem.label}${index}`}
                depthStep={depthStep || 10}
                depth={depth || 0}
                subItem={false}
                items={sidebarItem.items ? sidebarItem.items : []}
                label={sidebarItem.label ? sidebarItem.label : ''}
                Link={sidebarItem.Link ? sidebarItem.Link : undefined}
                name={sidebarItem.name ? sidebarItem.name : undefined}
              />
            ))}
          </List>
          {children}
        </div>
        <div>
          <Text
            label={`© Taraxa ${new Date().getFullYear()}`}
            variant="body1"
            color="textSecondary"
          />
        </div>
      </Drawer>
    </ThemeProvider>
  );
};

export default Sidebar;
