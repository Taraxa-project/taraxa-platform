import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { faucetUri } from '../../config';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';

export enum RequestLimit {
  ONE = 1,
  TWO = 2,
  FIVE = 5,
  SEVEN = 7,
}
export const useFaucetEffects = () => {
  const { currentNetwork } = useExplorerNetwork();
  const { isLoading, initLoading, finishLoading } = useExplorerLoader();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<RequestLimit>(1);
  const [displayToast, setDisplayToast] = useState<{
    display: boolean;
    variant?: 'success' | 'error' | 'warning' | undefined;
    text?: string;
  }>({ display: false, variant: undefined, text: '' });

  const sendTokenRequest = useCallback(() => {
    const requestTokens = async () => {
      initLoading();
      try {
        const response = await fetch(faucetUri, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            amount,
            timestamp: Date.now() / 1000,
          }),
        });
        if (!response)
          setDisplayToast({
            display: true,
            variant: 'error',
            text: 'The Faucet is currently down. Please come back later!',
          });
        if (response.status >= 500) {
          setDisplayToast({
            display: true,
            variant: 'warning',
            text: 'The Faucet ran into an unexpected error. Please come back later!',
          });
        } else if (response.status >= 400 && response.status < 500) {
          setDisplayToast({
            display: true,
            variant: 'error',
            text: 'Your request was invalid. Please consider retrying with valid inputs!',
          });
        } else {
          const data = await response.json();
          if (data.id) {
            setDisplayToast({
              display: true,
              variant: 'success',
              text: `Your request has been processed successfully. Please check your wallet connected to the ${currentNetwork} !`,
            });
          } else {
            setDisplayToast({
              display: true,
              variant: 'warning',
              text: 'Your request did not register successfully. Please come back later!',
            });
          }
        }
      } catch (error) {
        setDisplayToast({
          display: true,
          variant: 'error',
          text: 'The Faucet ran into an unexpected error. Please come back later!',
        });
      }
      finishLoading();
    };
    requestTokens();
  }, [address]);

  useEffect(() => {
    if (displayToast.display) {
      enqueueSnackbar(displayToast.text, {
        variant: displayToast.variant,
        autoHideDuration: 3000,
      });
    }
  }, [displayToast]);

  return {
    address,
    setAddress,
    amount,
    setAmount,
    isLoading,
    currentNetwork,
    sendTokenRequest,
    closeSnackbar,
  };
};
