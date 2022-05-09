import React, { useEffect } from 'react';
import useCMetamask from '../../services/useCMetamask';
import useWalletAuth from '../../services/useWalletAuth';

interface WalletSigninProps {
  isSigning: boolean;
}

const WalletSignIn = (props: WalletSigninProps) => {
  const { isSigning } = props;
  const [isLoading, setLoading] = React.useState(!!isSigning);

  const { account } = useCMetamask();
  const { isLogged, getNonce, login } = useWalletAuth();

  useEffect(() => {
    const walletLogin = async () => {
      if (account) {
        if (isSigning) {
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
      }
    };
    walletLogin();
  }, [account]);

  return <div>{isLoading ? `I'm loading` : `I'm not loading`}</div>;
};

export default WalletSignIn;
