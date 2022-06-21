import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useWalletAuthorizationApi } from './useApi';
import useCMetamask from './useCMetamask';
import useSigning from './useSigning';

export default function useWalletAuth() {
  const [isLogged, setLogged] = useState(false);
  const [isAuthorized, setAuthorized] = useState(false);
  const { account } = useCMetamask();
  const sign = useSigning();
  const api = useWalletAuthorizationApi();

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) setLogged(true);
  }, [account]);

  useEffect(() => {
    const isAccountAuthorized = async () => {
      if (!account) return;
      const result = await api.get(`/auth/${account}`);
      if (result.success && result.response) {
        setAuthorized(ethers.utils.getAddress(result.response) === account);
      } else {
        setAuthorized(false);
      }
    };
    isAccountAuthorized();
  }, [account]);

  const login = async (message: string) => {
    if (account) {
      const signedMessage = await sign(message);
      const result = await api.post('/auth/', {
        address: account,
        signature: signedMessage,
      });
      if (result.success) {
        setLogged(true);
        localStorage.setItem('jwt', result.response.token.accessToken);
      }
    }
  };

  const getNonce = async () => {
    let nonce = '-1';
    if (account) {
      const nonceRes = await api.get(`/auth/nonce/${account}`);
      if (nonceRes.success) {
        nonce = nonceRes.response;
      } else throw new Error(nonceRes.response);
    }
    return nonce;
  };

  const authorizeAddress = async () => {
    const result = await api.post(`/auth/${account}`, {});
    if (result.success) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
    }
  };

  return { isLogged, isAuthorized, login, getNonce, authorizeAddress };
}
