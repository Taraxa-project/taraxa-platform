import React from "react";
import { useMediaQuery } from 'react-responsive';
import { createStyles, CssBaseline, Drawer, DrawerProps, List, makeStyles, Theme, ThemeProvider } from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Text from '../Text';

import theme from "../theme";

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
      "& > div:first-child": {
        flex: 1
      },
      "& > div:last-child": {
        padding: '64px 0'
      }
    },
    drawerPaperMobile: {
      "& > div:last-child": {
        display: 'none'
      }
    },
    drawerContainer: {
      overflow: 'auto',
      backgroundColor: '#151823'
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      backgroundColor: '#151823'
    },
  }),
);

export interface SidebarProps extends DrawerProps {
  disablePadding?: boolean;
  dense?: boolean;
  depthStep?: 0;
  depth?: 0;
  className?: string;
  items: { label?: string, name?: string; Link?: JSX.Element, items?: { label?: string, name?: string, Link?: JSX.Element }[] }[];
};

interface SidebarItemProps {
  label?: string;
  name?: string;
  depthStep: number;
  depth: number;
  subItem: boolean;
  items: { label?: string, name?: string; Link?: JSX.Element, items?: { label?: string, name?: string, Link?: JSX.Element }[] }[];
  Link?: JSX.Element;
};

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

  if(isMobile) {
    paperClasses = [
      ...paperClasses,
      classes.drawerPaperMobile
    ];
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Drawer className="sidebar"
        variant={!isMobile ? 'permanent' : "temporary"}
        classes={{ paper: paperClasses.join(' ') }} anchor={isMobile ? "right" : "left"} elevation={0} {...props}>
        <div>
          <List disablePadding={disablePadding} dense={dense} id="sidebarList" className={className ? className : ''}>
            {items.map((sidebarItem, index) => (
              <SidebarItem
                key={`${sidebarItem.label}${index}`}
                depthStep={depthStep ? depthStep : 10}
                depth={depth ? depth : 0}
                subItem={false}
                items={sidebarItem.items ? sidebarItem.items : []}
                label={sidebarItem.label ? sidebarItem.label : ""}
                Link={sidebarItem.Link ? sidebarItem.Link : undefined}
                name={sidebarItem.name ? sidebarItem.name : undefined}
              />
            ))}
          </List>
          {children}
        </div>
        <div>
          <Text label={`© Taraxa ${new Date().getFullYear()}`} variant="body1" color="textSecondary" />
        </div>
      </Drawer>
    </ThemeProvider>
  );
}

const SidebarItem = ({ label, items, depthStep, depth, subItem, Link, name }: SidebarItemProps) => {
  const pathname = window.location.pathname.length > 1 ? window.location.pathname.substring(1) : window.location.pathname;
  return (
    <>
      <ListItem className={name === pathname && subItem ? 'subItemOpened' : name === pathname && !subItem ? 'itemOpened' : name === 'dashboard' && pathname === '/' && !subItem ? 'itemOpened' : subItem ? 'subItem' : !subItem && items.length < 1 ? 'soloItem' : 'item'} button dense>
        {Link ?
          <ListItemText primary={Link} style={{ paddingLeft: subItem ? depth * depthStep : !items ? (depth + 2) * depthStep : 15, marginTop: 0, marginBottom: 0 }}></ListItemText>
          :
          <>
            <ListItemText primary={<div className="label">{label}</div>} style={{ paddingLeft: subItem ? depth * depthStep : 15 }}></ListItemText>
          </>
        }
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
  )
}

export default Sidebar;