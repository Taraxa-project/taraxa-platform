import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { Modal } from '@taraxa_project/taraxa-ui';

import CloseIcon from '../../assets/icons/close';
import RegisterNode from './Modal/RegisterNode';

interface RunValidatorModalProps {
  isOpen: boolean;
  validatorType: 'mainnet' | 'testnet';
  onClose: () => void;
  onSuccess: () => void;
}

const RunValidatorModal = ({
  isOpen,
  validatorType,
  onClose,
  onSuccess,
}: RunValidatorModalProps) => {
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  if (!isOpen) {
    return null;
  }

  const modal = <RegisterNode type={validatorType} onSuccess={() => onSuccess()} />;

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
