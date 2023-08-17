import { useMetaMask } from 'metamask-react';
import { ethers } from 'ethers';

function useCMetamask() {
  const metamaskData = useMetaMask();

  const account = metamaskData.account ? ethers.utils.getAddress(metamaskData.account) : null;
  const chainId = metamaskData.chainId ? parseInt(metamaskData.chainId, 16) : 0;

  return { ...metamaskData, account, chainId };
}

export default useCMetamask;
