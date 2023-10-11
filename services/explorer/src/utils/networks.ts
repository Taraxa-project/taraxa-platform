import { NetworkName, getNetworkSubdomain } from '@taraxa_project/taraxa-sdk';

export const networkRedirect = (network: NetworkName): void => {
  const currentUrl = window.location.href;
  const isLocalhost = currentUrl.includes('localhost');
  const isQa = currentUrl.includes('qa.explorer.taraxa.io');
  const networkSubdomain = getNetworkSubdomain(network);

  let redirectUrl;
  if (isLocalhost) {
    redirectUrl = currentUrl;
  } else if (isQa) {
    const baseDomain = currentUrl.match(
      /^(https?:\/\/)?([^/?#]+)(?:[/?#]|$)/i
    )[2];
    redirectUrl = currentUrl.replace(
      baseDomain,
      `${networkSubdomain}.qa.explorer.taraxa.io`
    );
  } else {
    const baseDomain = currentUrl.match(
      /^(https?:\/\/)?([^/?#]+)(?:[/?#]|$)/i
    )[2];
    redirectUrl = currentUrl.replace(
      baseDomain,
      `${networkSubdomain}.explorer.taraxa.io`
    );
  }

  if (redirectUrl !== currentUrl) {
    window.location.replace(redirectUrl);
  }
};
