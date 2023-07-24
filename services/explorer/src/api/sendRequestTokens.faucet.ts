import { ToastData } from './types';

export async function sendRequestTokens(
  address: string,
  amount: number,
  currentNetwork: string,
  faucetUri: string,
  cb: (data: ToastData) => void
): Promise<void> {
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
      const responseObj = JSON.parse(await response.text());
      let text = '';
      if (response.status === 400) {
        text =
          'Your request was invalid. Please consider retrying with valid inputs!';
      }
      if (response.status === 429) {
        if (responseObj['message'] === 'Too many requests for address') {
          text = `You requested TARA too many times for ${address}. Please come back later!`;
        } else {
          text = `You requested TARA too many times from your ip. Please come back later!`;
        }
      }
      cb({
        display: true,
        variant: 'error',
        text:
          text || 'Your request could not be queued. Please come back later!',
      });
    } else {
      cb({
        display: true,
        variant: 'success',
        text: `Your request has been queued successfully. Please check your wallet connected to the ${currentNetwork} in a few seconds!`,
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    cb({
      display: true,
      variant: 'error',
      text: 'The Faucet ran into an unexpected error. Please come back later!',
    });
  }
}
