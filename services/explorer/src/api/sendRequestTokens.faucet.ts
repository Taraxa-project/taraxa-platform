import { ToastData } from '../utils';
import { faucetUri } from '../config';

export async function sendRequestTokens(
  address: string,
  amount: number,
  currentNetwork: string,
  cb: (data: ToastData) => void
) {
  try {
    const response = await fetch(`${faucetUri}/faucet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        amount,
        timestamp: Date.now(),
      }),
    });
    if (!response)
      cb({
        display: true,
        variant: 'error',
        text: 'The Faucet is currently down. Please come back later!',
      });
    if (response.status >= 500) {
      cb({
        display: true,
        variant: 'warning',
        text: 'The Faucet ran into an unexpected error. Please come back later!',
      });
    } else if (response.status >= 400 && response.status < 500) {
      cb({
        display: true,
        variant: 'error',
        text: 'Your request was invalid. Please consider retrying with valid inputs!',
      });
    } else {
      cb({
        display: true,
        variant: 'success',
        text: `Your request has been queued successfully. Please check your wallet connected to the ${currentNetwork} in a few seconds!`,
      });
    }
  } catch (error) {
    console.error(error);
    cb({
      display: true,
      variant: 'error',
      text: 'The Faucet ran into an unexpected error. Please come back later!',
    });
  }
}
