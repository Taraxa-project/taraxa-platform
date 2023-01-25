import { Button, Loading, Text } from '@taraxa_project/taraxa-ui';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { EmailIconSmall } from '../../assets/icons/email';
import WarningCircularIcon from '../../assets/icons/WarningCircular';
import { useDelegationApi } from '../../services/useApi';
import { GreenCircledCheckIconBig } from '../../assets/icons/greenCircularCheck';
import useCMetamask from '../../services/useCMetamask';
import useWalletAuth from '../../services/useWalletAuth';
import ModalContainer from './subcomponents/ModalContainer';
import ModalText from './subcomponents/ModalText';

interface WalletSigninProps {
  isSigning: boolean;
  onClassic: () => void;
  onSuccess: () => void;
}

const WalletSignIn = (props: WalletSigninProps) => {
  const { isSigning, onClassic, onSuccess } = props;
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
                  await login(nonce.toString());
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
    <ModalContainer>
      {isLoading ? (
        <>
          {' '}
          <Text
            label="Sign in / Sign up"
            variant="h6"
            color="primary"
            style={{ marginBottom: '12%' }}
          />
          <Loading />
          <ModalText
            marginTop="7%"
            marginBottom="12%"
            text="Check your wallet and sign the message..."
          />
        </>
      ) : isRegistered ? (
        <>
          <Text label="Success!" variant="h6" color="primary" style={{ marginBottom: '12%' }} />
          <GreenCircledCheckIconBig />
          <ModalText
            marginTop="7%"
            marginBottom="7%"
            text="Your account is successfully created / logged in."
          />
          <Button
            type="submit"
            label="Go to my account"
            color="secondary"
            variant="contained"
            className="marginButton"
            onClick={() => {
              onSuccess();
              history.push('/profile');
            }}
            fullWidth
          />
        </>
      ) : (
        <>
          <Text
            label="Sign in / Sign up"
            variant="h6"
            color="primary"
            style={{ marginBottom: '12%' }}
          />
          <WarningCircularIcon color="#FF515A" />
          <ModalText
            marginTop="7%"
            marginBottom="7%"
            color="#FF515A"
            text="We haven’t found an account associated with this ETH address."
          />
          <ModalText
            marginTop="7%"
            marginBottom="7%"
            text="If you have an account, please login with your email & password, and then verify your
          ETH wallet in your profile."
          />
          <ModalText marginTop="7%" marginBottom="7%" text="Email logins will be retired soon." />
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
        </>
      )}
    </ModalContainer>
  );
};

export default WalletSignIn;
