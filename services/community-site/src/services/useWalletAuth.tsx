import axios from 'axios';
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
      const result = await axios.get('http://localhost:3006/auth/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      });
      if (result.status === 200 && result.data) {
        setAuthorized(ethers.utils.getAddress(result.data.publicAddress) === account);
      } else {
        setAuthorized(false);
      }
    };
    isAccountAuthorized();
  }, [account, isLogged]);

  const login = async (message: string) => {
    if (account) {
      const signature = await sign(message);
      const result = await api.post('/auth/login', {
        publicAddress: account,
        signature,
      });
      if (result.success) {
        setLogged(true);
        localStorage.setItem('jwt', result.response.accessToken);
      }
    }
  };

  const getNonce = async () => {
    let nonce = -1;
    if (account) {
      const nonceRes = await api.get(`/auth?publicAddress=${account}`);
      if (nonceRes.success) {
        nonce = nonceRes.response.nonce;
      } else throw new Error(nonceRes.response);
    }
    return nonce;
  };

  const authorizeAddress = async () => {
    const nonce = await getNonce();
    if (nonce && account) {
      await login(nonce.toString());
    }
  };

  return { isLogged, isAuthorized, login, getNonce, authorizeAddress };
}
