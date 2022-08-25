import React, { useState } from 'react';
import {
  CssBaseline,
  IconButton,
  Menu,
  MenuItem,
  ThemeProvider,
  Tooltip,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Check } from '../Icons';
import useStyles from './NetworkMenu.styles';
import theme from '../theme';

export interface NetworkMenuProps {
  networks: string[];
  onNetworkChange?: (network: string) => void;
  verticalPosition?: 'top' | 'bottom';
  horizontalPosition?: 'left' | 'right';
}

const NetworkMenu = ({
  networks,
  onNetworkChange,
  verticalPosition = 'top',
  horizontalPosition = 'left',
}: NetworkMenuProps) => {
  const classes = useStyles();
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onNetworkClick = (network: string) => {
    setSelectedNetwork(network);
    if (typeof onNetworkChange === 'function') onNetworkChange(network);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Tooltip title='Network'>
        <IconButton
          className={classes.networkButton}
          onClick={handleClick}
          size='medium'
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
        >
          <MoreHorizIcon fontSize='inherit' />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        classes={{ paper: classes.menuPaper, list: classes.menuList }}
        className={classes.menuRoot}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={{
          vertical: verticalPosition,
          horizontal: horizontalPosition,
        }}
        transformOrigin={{
          vertical: verticalPosition,
          horizontal: horizontalPosition,
        }}
      >
        {networks?.map((network) => (
          <MenuItem
            classes={{
              root: classes.menuItemRoot,
              selected: classes.menuItemSelected,
            }}
            key={`${network}-${Date.now()}`}
            selected={network === selectedNetwork}
            onClick={() => onNetworkClick(network)}
          >
            <Check />
            {network}
          </MenuItem>
        ))}
      </Menu>
    </ThemeProvider>
  );
};

export default NetworkMenu;
