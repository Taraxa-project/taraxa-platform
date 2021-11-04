import { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { Button, Header as THeader } from '@taraxa_project/taraxa-ui';

import TaraxaIcon from '../../assets/icons/taraxaIcon';
import HamburgerIcon from '../../assets/icons/hamburger';

import { useAuth } from '../../services/useAuth';
import { useModal } from '../../services/useModal';
import { useSidebar } from '../../services/useSidebar';
import useOutsideClick from '../../services/useOutsideClick';

import Wallet from './../Wallet';
import './header.scss';

const Header = () => {
  const history = useHistory();

  const auth = useAuth();
  const { signIn } = useModal();
  const { open } = useSidebar();

  const isLoggedIn = auth.user?.id;

  const [showProfile, setShowProfile] = useState(false);
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  const ref = useRef<HTMLDivElement>(null);

  const profileTrigger = () => {
    setShowProfile(!showProfile);
  };

  const handleClickOutside = () => {
    setShowProfile(false);
  };

  useOutsideClick(ref, handleClickOutside);

  const goToProfile = () => {
    history.push('/profile');
    setShowProfile(false);
  };

  const signout = () => {
    history.push('/');
    auth.signout!();
    setShowProfile(false);
  };

  let button;

  if (isLoggedIn) {
    button = (
      <div ref={ref} className="profile-container">
        <Button
          label={auth.user?.username}
          color="primary"
          variant="outlined"
          onClick={profileTrigger}
        />
        {showProfile && (
          <div className="profile-modal">
            <Button
              label="My Profile"
              color="secondary"
              variant="contained"
              id="profileButton"
              onClick={goToProfile}
            />
            <Button label="Sign Out" color="primary" variant="outlined" onClick={signout} />
          </div>
        )}
      </div>
    );
  } else {
    button = <Button label="Sign in / Sign up" color="primary" variant="text" onClick={signIn} />;
  }

  const hamburger = (
    <div style={{ cursor: 'pointer' }} onClick={() => open!()}>
      <HamburgerIcon />
    </div>
  );

  return (
    <THeader title="Taraxa Community" className="header" color="primary" position="relative" Icon={TaraxaIcon} elevation={0}>
      <Wallet />
      {isMobile ? hamburger : isMobile ? <></> : button}
    </THeader>
  );
};

export default Header;
