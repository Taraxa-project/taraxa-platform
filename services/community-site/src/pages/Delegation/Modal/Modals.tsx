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
  reDelegatableBalance: ethers.BigNumber;
  delegateToValidator: Validator | null;
  reDelegateFromValidator?: Validator | null;
  undelegateFromValidator: Validator | null;
  delegatableValidators: Validator[];
  onDelegateSuccess: () => void;
  onReDelegateSuccess: () => void;
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
  reDelegatableBalance,
  delegateToValidator,
  reDelegateFromValidator,
  undelegateFromValidator,
  delegatableValidators,
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
        reDelegateFromValidator &&
        reDelegatableBalance && (
          <Modal
            id="delegateModal"
            title="Re-delegate to..."
            show={!!reDelegateFromValidator}
            children={
              <ReDelegate
                reDelegatableBalance={reDelegatableBalance}
                validatorFrom={reDelegateFromValidator}
                delegatableValidators={delegatableValidators}
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
