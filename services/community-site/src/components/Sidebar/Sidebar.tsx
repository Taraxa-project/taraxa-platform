import { useEffect } from 'react';
import { withRouter, useHistory } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useMetaMask } from 'metamask-react';
import { Button, Sidebar as MSidebar } from '@taraxa_project/taraxa-ui';

import BountiesSidebar from '../../assets/icons/bountiesSidebar';
import DeploySidebar from '../../assets/icons/deploySidebar';
import ExplorerSidebar from '../../assets/icons/explorerSidebar';
import GetStarted from '../../assets/icons/getStarted';
import NodeSidebar from '../../assets/icons/nodeSidebar';
import RedeemSidebar from '../../assets/icons/redeemSidebar';
import StakingSidebar from '../../assets/icons/stakingSidebar';
// import WalletSidebar from "../../assets/icons/walletSidebar";
import HamburgerIcon from '../../assets/icons/hamburger';

import NavLink from '../NavLink/NavLink';

import { useAuth } from '../../services/useAuth';
import { useModal } from '../../services/useModal';
import { useSidebar } from '../../services/useSidebar';

import './sidebar.scss';

const Sidebar = () => {
  const auth = useAuth();
  const { listen, push } = useHistory();
  const { status, connect } = useMetaMask();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  const { signIn } = useModal();
  const { isOpen, close } = useSidebar();

  useEffect(() => {
    const unlisten = listen(() => {
      if (isOpen) {
        close!();
      }
    });

    return unlisten;
  }, [listen, isOpen, close]);

  const menu = [
    {
      Link: <NavLink label="Get Started" Icon={GetStarted} to="/" />,
      name: 'dashboard',
    },
    {
      label: 'Earn',
      items: [
        {
          Link: <NavLink label="Staking" Icon={StakingSidebar} to="/staking" />,
          name: 'staking',
        },
        {
          Link: <NavLink label="Bounties" Icon={BountiesSidebar} to="/bounties" />,
          name: 'bounties',
        },
        { Link: <NavLink label="Redeem" Icon={RedeemSidebar} to="/redeem" />, name: 'redeem' },
      ],
    },
    {
      name: 'testnet',
      label: 'Testnet',
      items: [
        {
          Link: <NavLink label="Run a node" Icon={NodeSidebar} to="/node" />,
          name: 'node',
        },
        {
          Link: (
            <NavLink
              label="Taraxa Explorer"
              Icon={ExplorerSidebar}
              to={{ pathname: 'https://explorer.testnet.taraxa.io/' }}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
        },
        {
          Link: (
            <NavLink
              label="Deploy DApps"
              Icon={DeploySidebar}
              to={{ pathname: 'https://sandbox.testnet.taraxa.io/' }}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
        },
        // { Link: <NavLink label="Wallet" Icon={WalletSidebar} to="/wallet" />, name: "wallet" }
      ],
    },
  ];

  const isLoggedIn = auth.user?.id;

  const login = () => {
    close!();
    signIn!();
  };

  const goToProfile = () => {
    close!();
    push('/profile');
  };

  const button = !isLoggedIn ? (
    <Button
      label="Sign in / Sign up"
      color="secondary"
      variant="contained"
      fullWidth
      onClick={login}
    />
  ) : (
    <Button
      label="My Profile"
      color="secondary"
      variant="contained"
      fullWidth
      onClick={goToProfile}
    />
  );

  const mobileButtons = (
    <>
      {status === 'notConnected' && (
        <Button
          label="Connect Wallet"
          variant="outlined"
          color="primary"
          fullWidth
          onClick={async () => {
            try {
              await connect();
              close!();
            } catch (e) {}
          }}
        />
      )}
      {button}
    </>
  );

  const hamburger = (
    <div className="hamburger" style={{ cursor: 'pointer' }} onClick={() => close!()}>
      <HamburgerIcon />
    </div>
  );

  return (
    <MSidebar disablePadding dense items={menu} open={isOpen} onClose={() => close!()}>
      {hamburger && hamburger}
      {isMobile && mobileButtons && mobileButtons}
    </MSidebar>
  );
};

export default withRouter(Sidebar);
