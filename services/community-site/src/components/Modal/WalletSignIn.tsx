import { Button, Loading, Text } from '@taraxa_project/taraxa-ui';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { EmailIconSmall } from '../../assets/icons/email';
import RedWarningCircularIcon from '../../assets/icons/RedWarningCircular';
import { useDelegationApi } from '../../services/useApi';
import { GreenCircledCheckIconBig } from '../../assets/icons/greenCircledCheck';
import useCMetamask from '../../services/useCMetamask';
import useWalletAuth from '../../services/useWalletAuth';

interface WalletSigninProps {
  isSigning: boolean;
  onClassic: () => void;
}

const WalletSignIn = (props: WalletSigninProps) => {
  const { isSigning, onClassic } = props;
  const [isLoading, setLoading] = React.useState(!!isSigning);
  const [isRegistered, setRegistered] = React.useState(false);
  const api = useDelegationApi();
  const { account, connect } = useCMetamask();
  const { isLogged, getNonce, login } = useWalletAuth();
  const history = useHistory();

  useEffect(() => {
    const walletLogin = async () => {
      if (!account) await connect();
      if (account) {
        try {
          const registeredUserPrem = await api.get(`/user-auth/${account}`);
          if (registeredUserPrem.success) {
            const user = registeredUserPrem.response;
            if (user && user.id) {
              setLoading(false);
              setRegistered(true);
            } else {
              setLoading(false);
              setRegistered(false);
            }
            if (isSigning && isRegistered) {
              try {
                const nonce = await getNonce();
                if (nonce) {
                  await login(nonce);
                  setLoading(false);
                }
              } catch (error) {
                await login(account);
                if (isLogged) {
                  setLoading(false);
                }
              }
            }
          } else {
            setLoading(false);
            setRegistered(false);
          }
        } catch (error) {
          setLoading(false);
          setRegistered(true);
        }
      }
    };
    walletLogin();
  }, [account]);

  return (
    <div>
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Text
            label="Sign in / Sign up"
            variant="h6"
            color="primary"
            style={{ marginBottom: '12%' }}
          />
          <Loading />
          <span style={{ marginTop: '7%', marginBottom: '12%' }}>
            Check your wallet and sign the message...
          </span>
        </div>
      ) : isRegistered ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Text label="Success" variant="h6" color="primary" style={{ marginBottom: '12%' }} />
          <GreenCircledCheckIconBig />
          <span style={{ marginTop: '7%', marginBottom: '7%' }}>
            Your account is successfully created / logged in.
          </span>
          <Button
            type="submit"
            label="Go to my account"
            color="secondary"
            variant="contained"
            className="marginButton"
            onClick={() => history.push('/profile')}
            fullWidth
          />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Text
            label="Sign in / Sign up"
            variant="h6"
            color="primary"
            style={{ marginBottom: '12%' }}
          />
          <RedWarningCircularIcon />
          <span style={{ marginTop: '7%', marginBottom: '7%', color: '#FF515A' }}>
            We haven’t found an account associated with this ETH address.
          </span>
          <span style={{ marginTop: '7%', marginBottom: '7%' }}>
            If you have an account, please login with your email & password, and then verify your
            ETH wallet in your profile.
          </span>
          <span style={{ marginTop: '7%', marginBottom: '7%' }}>
            Email logins will be retired soon.
          </span>
          <Button
            type="submit"
            label="Sign in using E-mail & password"
            variant="contained"
            className="marginButton greyButton"
            onClick={onClassic}
            Icon={EmailIconSmall}
            disableElevation
            fullWidth
          />
        </div>
      )}
    </div>
  );
};

export default WalletSignIn;
