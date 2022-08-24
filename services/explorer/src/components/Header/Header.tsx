/* eslint-disable no-console */
import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { Button, Header as THeader, NetworkMenu } from '@taraxa_project/taraxa-ui';
// import { Container } from '@mui/material';

import { HamburgerIcon, TaraxaIcon } from '../icons';

import './header.scss';

const Header = () => {
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const buttons = (
    <div className="buttonsContainer">
      <Button label="DAG" color="primary" variant="text" onClick={() => console.log('DAG data')} />
      <Button
        label="Blocks"
        color="primary"
        variant="text"
        onClick={() => console.log('Blocks data')}
      />
      <Button
        label="Transactions"
        color="primary"
        variant="text"
        onClick={() => console.log('Transactions data')}
      />
      <Button
        label="Nodes"
        color="primary"
        variant="text"
        onClick={() => console.log('Nodes data')}
      />
      <Button
        label="Faucet"
        color="primary"
        variant="text"
        onClick={() => console.log('Faucet data')}
      />
      <NetworkMenu horizontalPosition="right" />
    </div>
  );

  const hamburger = (
    <div style={{ cursor: 'pointer' }} onClick={() => console.log('open!')}>
      <HamburgerIcon />
    </div>
  );

  return (
    <THeader
      title="Taraxa Community"
      className="header"
      color="primary"
      position="relative"
      withSearch
      Icon={TaraxaIcon}
      elevation={0}
    >
      {isMobile ? hamburger : buttons}
    </THeader>
  );
};

export default Header;
