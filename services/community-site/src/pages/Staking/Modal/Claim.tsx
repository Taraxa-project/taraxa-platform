import React from 'react';
import { ethers } from 'ethers';
import { Button, Text, AmountCard } from '@taraxa_project/taraxa-ui';
import { Validator } from '@taraxa_project/taraxa-sdk';

import useDelegation from '../../../services/useDelegation';

import { stripEth } from '../../../utils/eth';
import { useWalletPopup } from '../../../services/useWalletPopup';

type ClaimProps = {
  amount: ethers.BigNumber;
  validator: Validator;
  onSuccess: () => void;
  onFinish: () => void;
  commissionMode?: boolean;
};

const Claim = ({ amount, validator, onSuccess, onFinish, commissionMode = false }: ClaimProps) => {
  const { claimRewards, claimCommissionRewards } = useDelegation();
  const { asyncCallback } = useWalletPopup();

  const claim = async () => {
    asyncCallback(async () => {
      onFinish();
      if (commissionMode) {
        return await claimCommissionRewards(validator.address);
      }
      return await claimRewards(validator.address);
    }, onSuccess);
  };

  return (
    <div className="delegateNodeModal">
      <Text
        style={{ marginBottom: '32px', fontSize: '18px' }}
        align="center"
        label={commissionMode ? 'Claiming commission rewards from...' : 'Claiming rewards from...'}
        variant="h6"
        color="primary"
      />
      <div className="nodeDescriptor">
        <p className="nodeAddressWrapper">
          <span className="nodeAddress">{validator.address}</span>
        </p>
      </div>
      <div className="claimContainer">
        <p className="taraContainerAmountDescription">Amount to be claimed:</p>
        <AmountCard amount={stripEth(amount)} unit="TARA" />
        <br />
        <Button
          type="submit"
          label="Claim"
          fullWidth
          color="secondary"
          variant="contained"
          className="marginButton"
          onClick={() => {
            claim();
          }}
        />
      </div>
    </div>
  );
};

export default Claim;
