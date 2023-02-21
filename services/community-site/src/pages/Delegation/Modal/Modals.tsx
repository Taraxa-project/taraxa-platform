import React from 'react';
import { ethers } from 'ethers';
import { Modal } from '@taraxa_project/taraxa-ui';
import Delegate from './Delegate';
import Undelegate from './Undelegate';
import CloseIcon from '../../../assets/icons/close';

import { Validator } from '../../../interfaces/Validator';
import ReDelegate from './ReDelegate';

interface ModalsProps {
  balance: ethers.BigNumber;
  redelegationBalance: ethers.BigNumber;
  delegateToValidator: Validator | null;
  reDelegateToValidator?: Validator | null;
  undelegateFromValidator: Validator | null;
  onDelegateSuccess: () => void;
  onReDelegateSuccess?: () => void;
  onUndelegateSuccess: () => void;
  onDelegateFinish: () => void;
  onReDelegateFinish?: () => void;
  onUndelegateFinish: () => void;
  onDelegateClose: () => void;
  onReDelegateClose?: () => void;
  onUndelegateClose: () => void;
}

const Modals = ({
  balance,
  redelegationBalance,
  delegateToValidator,
  reDelegateToValidator,
  undelegateFromValidator,
  onDelegateSuccess,
  onReDelegateSuccess,
  onUndelegateSuccess,
  onDelegateFinish,
  onReDelegateFinish,
  onUndelegateFinish,
  onDelegateClose,
  onReDelegateClose,
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
      {onReDelegateSuccess &&
        onReDelegateClose &&
        onReDelegateFinish &&
        reDelegateToValidator &&
        redelegationBalance && (
          <Modal
            id="delegateModal"
            title="Delegate to..."
            show={!!reDelegateToValidator}
            children={
              <ReDelegate
                redelegationBalance={redelegationBalance}
                validatorTo={reDelegateToValidator}
                onSuccess={() => onReDelegateSuccess()}
                onFinish={() => onReDelegateFinish()}
              />
            }
            parentElementID="root"
            onRequestClose={() => onReDelegateClose()}
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
