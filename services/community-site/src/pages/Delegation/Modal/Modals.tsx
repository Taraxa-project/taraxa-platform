import React from 'react';
import { Modal } from '@taraxa_project/taraxa-ui';
import Delegate from './Delegate';
import Undelegate from './Undelegate';
import CloseIcon from '../../../assets/icons/close';

interface ModalsProps {
  delegateToNode: any;
  undelegateFromNode: any;
  onDelegateSuccess: () => void;
  onUndelegateSuccess: () => void;
  onDelegateFinish: () => void;
  onUndelegateFinish: () => void;
  account: any;
  availableBalance: number;
  onDelegateClose: () => void;
  onUndelegateClose: () => void;
}

const Modals = ({
  delegateToNode,
  undelegateFromNode,
  onDelegateSuccess,
  onUndelegateSuccess,
  onDelegateFinish,
  onUndelegateFinish,
  onDelegateClose,
  onUndelegateClose,
  account,
  availableBalance,
}: ModalsProps) => {
  return (
    <>
      {delegateToNode && (
        <Modal
          id="delegateModal"
          title="Delegate to..."
          show={!!delegateToNode}
          children={
            <Delegate
              validatorId={delegateToNode.id}
              validatorName={delegateToNode.name}
              validatorAddress={delegateToNode.address}
              delegatorAddress={account}
              remainingDelegation={delegateToNode.remainingDelegation}
              availableStakingBalance={availableBalance}
              onSuccess={() => onDelegateSuccess()}
              onFinish={() => onDelegateFinish()}
            />
          }
          parentElementID="root"
          onRequestClose={() => onDelegateClose()}
          closeIcon={CloseIcon}
        />
      )}
      {undelegateFromNode && (
        <Modal
          id="delegateModal"
          title="Undelegate from..."
          show={!!undelegateFromNode}
          children={
            <Undelegate
              validatorId={undelegateFromNode.id}
              validatorName={undelegateFromNode.name}
              validatorAddress={undelegateFromNode.address}
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
