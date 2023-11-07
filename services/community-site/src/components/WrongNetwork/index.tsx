import React from 'react';
import { Button } from '@taraxa_project/taraxa-ui';
import { networks } from '@taraxa_project/taraxa-sdk';
import useMainnet from '../../services/useMainnet';
import useCMetamask from '../../services/useCMetamask';

const WrongNetwork = () => {
  const mainnet = useMainnet();
  const { switchChain, addChain } = useCMetamask();

  const switchNetwork = async () => {
    const hexChainId = `0x${mainnet.chainId.toString(16)}`;
    const { chainName, rpcUrl, blockExplorerUrl, iconUrl, nativeCurrency } =
      networks[mainnet.chainId];

    try {
      await switchChain(hexChainId);
    } catch (e: any) {
      if (e.code === 4902) {
        try {
          await addChain({
            chainName,
            nativeCurrency,
            chainId: hexChainId,
            blockExplorerUrls: [blockExplorerUrl],
            iconUrls: [iconUrl],
            rpcUrls: [rpcUrl],
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      }
    }
  };

  return (
    <Button
      variant="contained"
      color="error"
      label="Switch to Taraxa Mainnet"
      size="small"
      className="smallBtn"
      onClick={() => switchNetwork()}
      disableElevation
    />
  );
};

export default WrongNetwork;
