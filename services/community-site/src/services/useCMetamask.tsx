import { useMetaMask } from 'metamask-react';
import { ethers } from 'ethers';

function useCMetamask() {
  const metamaskData = useMetaMask();

  const account = metamaskData.account ? ethers.utils.getAddress(metamaskData.account) : null;

  return { ...metamaskData, account };
}

export default useCMetamask;
