import React, { useState } from 'react';
import { Button, Text } from '@taraxa_project/taraxa-ui';
import useCMetamask from '../../services/useCMetamask';
import useWalletAuth from '../../services/useWalletAuth';
import MetamaskIcon from '../../assets/icons/metamask';
import { GreenCircledCheckIconBig } from '../../assets/icons/greenCircularCheck';
import ModalContainer from './subcomponents/ModalContainer';
import ModalText from './subcomponents/ModalText';

interface VerifyWalletProps {
  onSuccess: () => void;
}

enum WalletVerificationStatus {
  STARTED = 1,
  ACCEPTED = 2,
}

const VerifyWallet = (props: VerifyWalletProps) => {
  const { authorizeAddress } = useWalletAuth();
  const { account } = useCMetamask();
  const [verificationStatus, setVerificationStatus] = useState<WalletVerificationStatus>(
    WalletVerificationStatus.STARTED,
  );
  const { onSuccess } = props;
  const verificationStarted = verificationStatus === WalletVerificationStatus.STARTED;
  const verificationAccepted = verificationStatus === WalletVerificationStatus.ACCEPTED;
  return (
    <ModalContainer wrap>
      <Text label="IMPORTANT NOTICE" variant="h6" color="primary" style={{ marginBottom: '12%' }} />
      <GreenCircledCheckIconBig color="#878CA4" />
      {verificationStarted && (
        <>
          <ModalText
            marginTop="7%"
            marginBottom="7%"
            bold
            text="You are connected to a new ETH wallet. (this wallet wasn’t registered yet)"
          />
          <ModalText
            marginTop="7%"
            marginBottom="7%"
            text="Do you wish to create a new account? Or you can switch your wallet in MetaMask."
          />
          <Button
            type="submit"
            label="Create a new account"
            variant="contained"
            className="marginButton greyButton"
            onClick={() => setVerificationStatus(WalletVerificationStatus.ACCEPTED)}
            Icon={MetamaskIcon}
            disableElevation
            fullWidth
          />
        </>
      )}
      {verificationAccepted && (
        <>
          <ModalText
            marginTop="7%"
            marginBottom="7%"
            bold
            text=" Make sure you’ve selected the right wallet. You will only be able to login using this
            wallet."
          />
          <ModalText
            marginTop="7%"
            marginBottom="7%"
            color="#15AC5B"
            background="#31364B"
            borderRadius="4px"
            text={account || ''}
          />
          <ModalText
            marginTop="7%"
            marginBottom="7%"
            text=" If you already staked, please make sure you’ve selected the wallet that was used for
            staking. New wallets won’t be eligible for rewards."
          />
          <Button
            type="submit"
            label="I understand"
            variant="contained"
            className="marginButton greyButton"
            onClick={() => {
              authorizeAddress();
              onSuccess();
            }}
            Icon={MetamaskIcon}
            disableElevation
            fullWidth
          />
        </>
      )}
    </ModalContainer>
  );
};
export default VerifyWallet;
