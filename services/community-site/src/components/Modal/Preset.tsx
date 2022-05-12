import React from 'react';
import { Button, Text } from '@taraxa_project/taraxa-ui';
import MetamaskIcon from '../../assets/icons/metamask';
import { EmailIconSmall } from '../../assets/icons/email';

interface PresetProps {
  onMM: () => void;
  onClassic: () => void;
  onRegister: () => void;
}

const Preset = (props: PresetProps) => {
  const { onMM, onClassic, onRegister } = props;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
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
      <span style={{ marginTop: '5%', marginBottom: '5%' }}>Don’t have an account yet?</span>
      <Button
        type="submit"
        label="Create an account using MetaMask"
        variant="contained"
        className="marginButton greyButton"
        onClick={onRegister}
        Icon={MetamaskIcon}
        disableElevation
        fullWidth
      />
    </div>
  );
};

export default Preset;
