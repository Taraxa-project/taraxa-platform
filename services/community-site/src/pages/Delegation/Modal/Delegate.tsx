import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Text, InputField, AmountCard } from '@taraxa_project/taraxa-ui';

import useDelegation from '../../../services/useDelegation';

import { stripEth, weiToEth } from '../../../utils/eth';
import { Validator } from '../../../interfaces/Validator';
import { useWalletPopup } from '../../../services/useWalletPopup';

type DelegateProps = {
  balance: ethers.BigNumber;
  validator: Validator;
  onSuccess: () => void;
  onFinish: () => void;
};

const Delegate = ({ balance, validator, onSuccess, onFinish }: DelegateProps) => {
  const { delegate } = useDelegation();
  const { asyncCallback } = useWalletPopup();

  let maximumDelegatable = ethers.BigNumber.from('0');
  if (validator.availableForDelegation.gt(balance)) {
    maximumDelegatable = balance;
  } else {
    maximumDelegatable = validator.availableForDelegation;
  }

  const [delegationTotal, setDelegationTotal] = useState(maximumDelegatable);
  const [error, setError] = useState('');

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const delegationNumber = parseInt(delegationTotal.toString(), 10);
    if (Number.isNaN(delegationNumber) || delegationNumber < 1000) {
      setError('must be a number greater than 1,000');
      return;
    }

    if (delegationTotal.gt(balance)) {
      setError('cannot exceed TARA available for delegation');
      return;
    }
    if (delegationTotal.gt(maximumDelegatable)) {
      setError("cannot exceed validator's ability to receive delegation");
      return;
    }

    setError('');

    if (!error) {
      asyncCallback(async () => {
        onSuccess();
        onFinish();
        return await delegate(validator.address, delegationTotal);
      });
    }
  };

  return (
    <div className="delegateNodeModal">
      <Text
        style={{ marginBottom: '32px', fontSize: '18px' }}
        align="center"
        label="Delegate to..."
        variant="h6"
        color="primary"
      />
      <div className="nodeDescriptor">
        <p className="nodeAddressWrapper">
          <span className="nodeAddress">{validator.address}</span>
        </p>
      </div>
      <div className="taraContainerWrapper">
        <div className="taraContainer taraContainerBalance">
          <p className="taraContainerAmountDescription">My available TARA for delegation</p>
          <AmountCard amount={stripEth(balance)} unit="TARA" />
        </div>
        <div className="taraContainer">
          <p className="taraContainerAmountDescription">
            Validator’s availability to receive delegation
          </p>
          <AmountCard amount={stripEth(validator.availableForDelegation)} unit="TARA" />
        </div>
      </div>
      <div className="taraInputWrapper">
        <p className="maxDelegatableDescription">Maximum delegate-able</p>
        <p className="maxDelegatableTotal">{stripEth(maximumDelegatable)}</p>
        <p className="maxDelegatableUnit">TARA</p>
        <InputField
          error={!!error}
          helperText={error}
          label="Enter amount..."
          value={parseInt(weiToEth(delegationTotal), 10)}
          variant="outlined"
          type="text"
          fullWidth
          margin="normal"
          onChange={(event) => {
            if (delegationTotal.gt(balance)) {
              setError('cannot exceed TARA available for delegation');
            } else if (
              ethers.BigNumber.from(event.target.value || 0).lt(ethers.BigNumber.from('1000'))
            ) {
              setError('must be a number greater than 1,000');
            } else {
              setError('');
            }
            setDelegationTotal(
              ethers.BigNumber.from(event.target.value || 0).mul(
                ethers.BigNumber.from('10').pow(18),
              ),
            );
          }}
        />
        <div className="delegatePercentWrapper">
          <Button
            size="small"
            className="delegatePercent"
            label="25%"
            variant="contained"
            onClick={() => {
              setDelegationTotal(maximumDelegatable.mul(25).div(100));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="50%"
            variant="contained"
            onClick={() => {
              setDelegationTotal(maximumDelegatable.mul(50).div(100));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="75%"
            variant="contained"
            onClick={() => {
              setDelegationTotal(maximumDelegatable.mul(75).div(100));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="100%"
            variant="contained"
            onClick={() => {
              setDelegationTotal(maximumDelegatable);
            }}
          />
        </div>
        <Button
          type="submit"
          label="Delegate"
          color="secondary"
          variant="contained"
          className="marginButton"
          disabled={error !== ''}
          fullWidth
          onClick={submit}
        />
      </div>
    </div>
  );
};

export default Delegate;
