import React, { useState } from 'react';
import { CssBaseline, IconButton, Menu, MenuItem, ThemeProvider, Tooltip } from '@material-ui/core';
import { MenuDots, Check } from '../Icons';
import useStyles from './NetworkMenu.styles';
import theme from '../theme';

enum Network {
  TESTNET = 'Californicum Testnet',
  MAINNET = 'Mainnet Candidate',
}

export interface NetworkMenuProps {
  onNetworkChange?: (network: Network) => any;
  verticalPosition?: 'top' | 'bottom';
  horizontalPosition?: 'left' | 'right';
}

const NetworkMenu = ({
  onNetworkChange,
  verticalPosition = 'top',
  horizontalPosition = 'left',
}: NetworkMenuProps) => {
  const classes = useStyles();
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(Network.TESTNET);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onNetworkClick = (network: Network) => {
    setSelectedNetwork(network);
    if (typeof onNetworkChange === 'function') onNetworkChange(network);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Tooltip title="Network">
        <IconButton
          classes={{
            root: classes.iconButtonRoot,
          }}
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <MenuDots />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        classes={{ paper: classes.menuPaper, list: classes.menuList }}
        className={classes.menuRoot}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={{ vertical: verticalPosition, horizontal: horizontalPosition }}
        transformOrigin={{ vertical: verticalPosition, horizontal: horizontalPosition }}
      >
        {Object.keys(Network).map((network) => (
          <MenuItem
            classes={{ root: classes.menuItemRoot, selected: classes.menuItemSelected }}
            key={Network[network as keyof typeof Network]}
            selected={Network[network as keyof typeof Network] === selectedNetwork}
            onClick={() => onNetworkClick(Network[network as keyof typeof Network])}
          >
            <Check />
            {Network[network as keyof typeof Network]}
          </MenuItem>
        ))}
      </Menu>
    </ThemeProvider>
  );
};

export default NetworkMenu;
