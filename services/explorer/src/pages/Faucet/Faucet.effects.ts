import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { getTokens } from '../../api';
import { RequestLimit, ToastData } from '../../utils';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';

export const useFaucetEffects = () => {
  const { currentNetwork } = useExplorerNetwork();
  const { isLoading, initLoading, finishLoading } = useExplorerLoader();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<RequestLimit>(1);
  const [displayToast, setDisplayToast] = useState<ToastData>({
    display: false,
    variant: undefined,
    text: '',
  });

  const sendTokenRequest = useCallback(() => {
    const requestTokens = async () => {
      initLoading();
      await getTokens(address, amount, currentNetwork, setDisplayToast);
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
