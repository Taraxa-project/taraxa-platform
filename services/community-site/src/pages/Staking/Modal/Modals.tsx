import React from 'react';
import { ethers } from 'ethers';
import { Modal } from '@taraxa_project/taraxa-ui';
import Delegate from './Delegate';
import Undelegate from './Undelegate';
import CloseIcon from '../../../assets/icons/close';

import { Validator } from '../../../interfaces/Validator';
import ReDelegate from './ReDelegate';
import Claim from './Claim';

interface ModalsProps {
  balance: ethers.BigNumber;
  claimAmount: ethers.BigNumber;
  claimRewardsFromValidator: Validator | null;
  reDelegatableBalance: ethers.BigNumber;
  delegateToValidator: Validator | null;
  reDelegateFromValidator?: Validator | null;
  undelegateFromValidator: Validator | null;
  delegatableValidators: Validator[];
  ownDelegation?: boolean;
  onClaimSuccess: () => void;
  onDelegateSuccess: () => void;
  onReDelegateSuccess: () => void;
  onUndelegateSuccess: () => void;
  onClaimFinish: () => void;
  onDelegateFinish: () => void;
  onReDelegateFinish?: () => void;
  onUndelegateFinish: () => void;
  onDelegateClose: () => void;
  onClaimClose: () => void;
  onReDelegateClose?: () => void;
  onUndelegateClose: () => void;
}

const Modals = ({
  balance,
  claimAmount,
  claimRewardsFromValidator,
  reDelegatableBalance,
  delegateToValidator,
  reDelegateFromValidator,
  undelegateFromValidator,
  delegatableValidators,
  ownDelegation,
  onClaimSuccess,
  onDelegateSuccess,
  onReDelegateSuccess,
  onUndelegateSuccess,
  onClaimFinish,
  onDelegateFinish,
  onReDelegateFinish,
  onUndelegateFinish,
  onClaimClose,
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
              ownDelegation={!!ownDelegation}
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
      {claimRewardsFromValidator && (
        <Modal
          id="delegateModal"
          title="Claim from..."
          show={!!claimRewardsFromValidator}
          children={
            <Claim
              amount={claimAmount}
              validator={claimRewardsFromValidator}
              onSuccess={() => onClaimSuccess()}
              onFinish={() => onClaimFinish()}
            />
          }
          parentElementID="root"
          onRequestClose={() => onClaimClose()}
          closeIcon={CloseIcon}
        />
      )}
    </>
  );
};

export default Modals;
