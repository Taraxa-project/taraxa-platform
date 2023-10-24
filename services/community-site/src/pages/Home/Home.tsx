import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useHistory, withRouter, RouteComponentProps } from 'react-router-dom';

import { IconCard, ToggleButton, Notification } from '@taraxa_project/taraxa-ui';

import StakingIcon from '../../assets/icons/staking';
import BountiesIcon from '../../assets/icons/bounties';
import RedeemIcon from '../../assets/icons/redeem';
import NodeIcon from '../../assets/icons/node';
import ExplorerIcon from '../../assets/icons/explorer';
import DeployIcon from '../../assets/icons/deploy';

import { useAuth } from '../../services/useAuth';
import { useModal } from '../../services/useModal';

import Title from '../../components/Title/Title';

import './home.scss';

interface HomeProps {
  code: string | undefined;
}

const Home = ({ match }: RouteComponentProps<HomeProps>) => {
  const auth = useAuth();
  const { setIsOpen, setContent, setCode } = useModal();

  useEffect(() => {
    if (match.path.includes('/first-login')) {
      if (auth.user !== null) {
        auth.refreshUser!();
      }

      setIsOpen!(true);
      setContent!('email-confirmed');
    }
    if (match.path.includes('/reset-password')) {
      setIsOpen!(true);
      setContent!('reset-password');
      setCode!(match.params.code);
    }
  }, []);

  const history = useHistory();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const [toggleValue, setToggleValue] = useState('earn');

  const toggleOptions = [
    { value: 'earn', label: 'Earn' },
    { value: 'mainnet', label: 'Participate' },
  ];

  const onToggle = (event: React.MouseEvent<HTMLElement>, value: string) => {
    const options = toggleOptions.map((toggleOption) => toggleOption.value);
    if (options.includes(value)) {
      setToggleValue(value);
    }
  };

  return (
    <div className={isMobile ? 'home-mobile' : 'home'}>
      <div className="home-content">
        <Title title="Get started" subtitle="Welcome to Taraxa's community site!" />
        {isMobile && (
          <ToggleButton
            exclusive
            onChange={onToggle}
            currentValue={toggleValue}
            data={toggleOptions}
            className="toggleButton"
          />
        )}
        <div
          className="notification"
          style={{
            display: isMobile && toggleValue !== 'earn' ? 'none' : 'inherit',
          }}
        >
          <Notification title="EARN" text="Earn rewards while helping us grow." variant="success" />
        </div>
        <div
          className="cardContainer"
          style={{
            display: isMobile && toggleValue !== 'earn' ? 'none' : isMobile ? 'inherit' : 'flex',
          }}
        >
          <IconCard
            title="Staking"
            description="Earn rewards and help secure the Taraxa network."
            onClickText="Get Started"
            onClickButton={() => history.push('/staking')}
            Icon={StakingIcon}
          />
          <IconCard
            title="Bounties"
            description="Earn rewards while learning about Taraxa and grow it’s ecosystem."
            onClickText="Get Started"
            onClickButton={() => history.push('/bounties')}
            Icon={BountiesIcon}
          />
          <IconCard
            title="Redeem"
            description="Redeem TARA points for $TARA tokens and cool Taraxa swag."
            onClickText="Get Started"
            onClickButton={() => history.push('/redeem')}
            Icon={RedeemIcon}
          />
        </div>
        <div
          className="notification"
          style={{
            display: isMobile && toggleValue !== 'mainnet' ? 'none' : 'inherit',
          }}
        >
          <Notification
            title="Participate"
            text="Participate in Taraxa`s public networks."
            variant="success"
          />
        </div>
        <div
          className="cardContainer"
          style={{
            display: isMobile && toggleValue !== 'mainnet' ? 'none' : isMobile ? 'inherit' : 'flex',
          }}
        >
          <IconCard
            title="Run a node"
            description="Earn rewards while helping to secure Taraxa’s network."
            onClickText="Get Started"
            onClickButton={() => history.push('/node')}
            Icon={NodeIcon}
          />
          <IconCard
            title="Taraxa explorer"
            description="Explore the ledger and find the transaction’s data."
            onClickText="Get Started"
            onClickButton={() =>
              window.open('https://mainnet.explorer.taraxa.io/', '_blank', 'noreferrer noopener')
            }
            Icon={ExplorerIcon}
          />
          <IconCard
            title="Deploy DApps"
            description="Earn rewards while learning about Taraxa and grow it’s ecosystem."
            onClickText="Get Started"
            onClickButton={() =>
              window.open('https://www.taraxa.io/build/', '_blank', 'noreferrer noopener')
            }
            Icon={DeployIcon}
          />
        </div>
      </div>
    </div>
  );
};

export default withRouter(Home);
