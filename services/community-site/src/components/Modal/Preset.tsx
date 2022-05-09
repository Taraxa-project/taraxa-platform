import React from 'react';
import { Button } from '@taraxa_project/taraxa-ui';
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
      <br />
      <span>Don’t have an account yet?</span>
      <br />
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
