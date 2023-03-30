import React, { useEffect } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { BrowserRouter, Switch, Route, useLocation } from 'react-router-dom';
import { MetaMaskProvider } from 'metamask-react';
import { useMediaQuery } from 'react-responsive';
import { Notification } from '@taraxa_project/taraxa-ui';

import { AuthProvider, useAuth } from './services/useAuth';
import { LoadingProvider } from './services/useLoading';
import { ModalProvider, useModal } from './services/useModal';
import { SidebarProvider } from './services/useSidebar';

import Header from './components/Header/Header';
import LoadingWidget from './components/LoadingWidget/LoadingWidget';
import Footer from './components/Footer/Footer';
import Sidebar from './components/Sidebar/Sidebar';

import Home from './pages/Home/Home';
import Delegation from './pages/Delegation/Delegation';
import NodeProfilePage from './pages/Delegation/NodeProfilePage';
import Bounties from './pages/Bounties/Bounties';
import BountyDetails from './pages/Bounties/BountyDetails';
import BountySubmit from './pages/Bounties/BountySubmit';
import Redeem from './pages/Redeem/Redeem';
import Profile from './pages/Profile/Profile';
import RunValidator from './pages/RunNode/RunValidator';
import Wallet from './pages/Wallet/Wallet';
import useCMetamask from './services/useCMetamask';
import { WalletPopupProvider } from './services/useWalletPopup';

import './App.scss';

declare global {
  interface Window {
    gtag: any;
  }
}

const Root = () => {
  const { modal, setIsOpen, setContent, signIn } = useModal();
  const auth = useAuth();
  const { status, account } = useCMetamask();
  const location = useLocation();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const isTablet = useMediaQuery({ query: `(max-width: 1421px)` });

  useEffect(() => {
    window.gtag('config', 'G-QEVR9SEH2J', {
      page_title: location.pathname,
      page_path: location.pathname,
    });
  }, [location]);

  useEffect(() => {
    if (auth.isSessionExpired) {
      signIn!();
    }
  }, [auth.isSessionExpired]);

  let appClassName = 'App';

  if (isMobile) {
    appClassName += ' App-mobile';
  }

  if (isTablet) {
    appClassName += ' App-tablet';
  }

  const confirmEmail = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    await auth.emailConfirmation!();

    setIsOpen!(true);
    setContent!('sign-up-success');
  };

  const isLoggedIn = auth.user?.id;
  const isConfirmed = auth.user?.confirmed;
  const walletConnected = status === 'connected';
  const userWallet = auth.user?.eth_wallet ? auth.user?.eth_wallet?.toLocaleLowerCase() : '';
  const accountWallet = account?.toLocaleLowerCase();

  return (
    <div className={appClassName}>
      {modal}
      <Header />
      {isLoggedIn && !isConfirmed && (
        <div className="notification">
          <Notification title="Account not confirmed" variant="danger">
            Your email address is not confirmed. Please confirm your email address by clicking{' '}
            <a href="#" className="default-link" onClick={confirmEmail}>
              here
            </a>
          </Notification>
        </div>
      )}
      {isLoggedIn && walletConnected && userWallet !== accountWallet && (
        <div className="notification">
          <Notification variant="danger">
            Please be advised that rewards are tied to wallet addresses. Staking rewards are tied to
            the wallet you used to stake, and bounty rewards such as node operating rewards are tied
            to the address you entered into your profile. If you don't see your staking or bounty
            rewards, please confirm that you're connected to the right wallet.
          </Notification>
        </div>
      )}
      <div className="App-Container">
        <Sidebar />
        <div className="App-Content">
          <div className="App-Page">
            <LoadingWidget />
            <Switch>
              <Route exact path="/first-login" component={Home} />
              <Route exact path="/reset-password/:code" component={Home} />
              <Route exact path="/delegation" component={Delegation} />
              <Route exact path="/delegation/:address" component={NodeProfilePage} />
              <Route exact path="/bounties" component={Bounties} />
              <Route exact path="/bounties/:id" component={BountyDetails} />
              <Route exact path="/bounties/:id/submit" component={BountySubmit} />
              <Route exact path="/redeem" component={Redeem} />
              <Route exact path="/profile" component={Profile} />
              <Route exact path="/node" component={RunValidator} />
              <Route exact path="/wallet" component={Wallet} />
              <Route exact path="/" component={Home} />
            </Switch>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <MetaMaskProvider>
      <GoogleReCaptchaProvider reCaptchaKey="6LdLJXAaAAAAAAipA9gQ8gpbvVs6b9Jq64Lmr9dl">
        <LoadingProvider>
          <AuthProvider>
            <BrowserRouter>
              <ModalProvider>
                <WalletPopupProvider>
                  <SidebarProvider>
                    <Root />
                  </SidebarProvider>
                </WalletPopupProvider>
              </ModalProvider>
            </BrowserRouter>
          </AuthProvider>
        </LoadingProvider>
      </GoogleReCaptchaProvider>
    </MetaMaskProvider>
  );
}

export default App;
