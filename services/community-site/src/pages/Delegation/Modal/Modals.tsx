import React from 'react';
import { ethers } from 'ethers';
import { Modal } from '@taraxa_project/taraxa-ui';
import Delegate from './Delegate';
import Undelegate from './Undelegate';
import CloseIcon from '../../../assets/icons/close';

import { Validator } from '../../../interfaces/Validator';

interface ModalsProps {
  balance: ethers.BigNumber;
  delegateToValidator: Validator | null;
  undelegateFromValidator: Validator | null;
  onDelegateSuccess: () => void;
  onUndelegateSuccess: () => void;
  onDelegateFinish: () => void;
  onUndelegateFinish: () => void;
  onDelegateClose: () => void;
  onUndelegateClose: () => void;
}

const Modals = ({
  balance,
  delegateToValidator,
  undelegateFromValidator,
  onDelegateSuccess,
  onUndelegateSuccess,
  onDelegateFinish,
  onUndelegateFinish,
  onDelegateClose,
  onUndelegateClose,
}: ModalsProps) => {
  return (
    <>
      {delegateToValidator && (
        <Modal
          id="delegateModal"
          title="Delegate to..."
          show={!!delegateToValidator}
          children={
            <Delegate
              balance={balance}
              validator={delegateToValidator}
              onSuccess={() => onDelegateSuccess()}
              onFinish={() => onDelegateFinish()}
            />
          }
          parentElementID="root"
          onRequestClose={() => onDelegateClose()}
          closeIcon={CloseIcon}
        />
      )}
      {undelegateFromValidator && (
        <Modal
          id="delegateModal"
          title="Undelegate from..."
          show={!!undelegateFromValidator}
          children={
            <Undelegate
              validator={undelegateFromValidator}
              onSuccess={() => onUndelegateSuccess()}
              onFinish={() => onUndelegateFinish()}
            />
          }
          parentElementID="root"
          onRequestClose={() => onUndelegateClose()}
          closeIcon={CloseIcon}
        />
      )}
    </>
  );
};

export default Modals;
