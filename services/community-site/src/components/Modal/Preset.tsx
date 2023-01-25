import React, { useState } from 'react';
import { Button, Text } from '@taraxa_project/taraxa-ui';
import { useHistory } from 'react-router-dom';
import { GreenCircledCheckIconBig } from '../../assets/icons/greenCircularCheck';
import useCMetamask from '../../services/useCMetamask';
import MetamaskIcon from '../../assets/icons/metamask';
import { EmailIconSmall } from '../../assets/icons/email';
import useWalletAuth from '../../services/useWalletAuth';
import ModalText from './subcomponents/ModalText';
import ModalContainer from './subcomponents/ModalContainer';

interface PresetProps {
  onMM: () => void;
  onClassic: () => void;
  onSuccess: () => void;
}

const Preset = (props: PresetProps) => {
  const [isRegistered, setRegistered] = useState(false);
  const { account, connect } = useCMetamask();
  const history = useHistory();
  const { authorizeAddress, isAuthorized } = useWalletAuth();
  const { onMM, onClassic, onSuccess } = props;

  const registerMM = async () => {
    if (!account) {
      await connect();
    }
    if (isAuthorized) {
      setRegistered(true);
    } else {
      await authorizeAddress();
      setRegistered(isAuthorized);
      onSuccess();
      history.push('/profile');
    }
  };
  return (
    <ModalContainer>
      {isRegistered ? (
        <>
          <Text label="Success!" variant="h6" color="primary" style={{ marginBottom: '12%' }} />
          <GreenCircledCheckIconBig />
          <ModalText
            marginTop="7%"
            marginBottom="7%"
            text="Your account is successfully created / logged in."
          />
          <Button
            type="submit"
            label="Go to my account"
            color="secondary"
            variant="contained"
            className="marginButton"
            onClick={() => {
              onSuccess();
              history.push('/profile');
            }}
            fullWidth
          />
        </>
      ) : (
        <>
          <Text label="Sign in" variant="h6" color="primary" style={{ marginBottom: '12%' }} />
          <Button
            type="submit"
            label="Sign in using E-mail & password"
            variant="contained"
            className="marginButton greyButton"
            onClick={onClassic}
            Icon={EmailIconSmall}
            disableElevation
            fullWidth
          />
          <Button
            type="submit"
            label="Sign in using MetaMask"
            className="marginButton greyButton"
            variant="contained"
            onClick={onMM}
            Icon={MetamaskIcon}
            disableElevation
            fullWidth
          />
          <ModalText marginTop="5%" marginBottom="5%" text="Don’t have an account yet?" />
          <Button
            type="submit"
            label="(Coming Soon) Create an account using MetaMask"
            disabled
            variant="contained"
            className="marginButton greyButton"
            onClick={registerMM}
            Icon={MetamaskIcon}
            disableElevation
            fullWidth
          />
        </>
      )}
    </ModalContainer>
  );
};

export default Preset;
