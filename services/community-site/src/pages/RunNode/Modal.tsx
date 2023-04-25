import React from 'react';
import { ethers } from 'ethers';
import { useMediaQuery } from 'react-responsive';
import { Modal } from '@taraxa_project/taraxa-ui';

import CloseIcon from '../../assets/icons/close';
import RegisterNode from './Modal/RegisterNode';
import { ValidatorType } from '../../interfaces/Validator';

interface RunValidatorModalProps {
  balance: ethers.BigNumber;
  isOpen: boolean;
  validatorType: ValidatorType;
  onClose: () => void;
  onSuccess: () => void;
}

const RunValidatorModal = ({
  balance,
  isOpen,
  validatorType,
  onClose,
  onSuccess,
}: RunValidatorModalProps) => {
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  if (!isOpen) {
    return null;
  }

  const modal = (
    <RegisterNode balance={balance} type={validatorType} onSuccess={onSuccess} onClose={onClose} />
  );

  return (
    <Modal
      id={isMobile ? 'mobile-signinModal' : 'signinModal'}
      title="Register Node"
      show={isOpen}
      children={modal}
      parentElementID="root"
      onRequestClose={() => onClose()}
      closeIcon={CloseIcon}
    />
  );
};

export default RunValidatorModal;
