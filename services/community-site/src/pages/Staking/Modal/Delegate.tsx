import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Text, InputField, AmountCard } from '@taraxa_project/taraxa-ui';

import useDelegation from '../../../services/useDelegation';

import { stripEth, weiToEth } from '../../../utils/eth';
import { Validator } from '../../../interfaces/Validator';
import { useWalletPopup } from '../../../services/useWalletPopup';
import { compareDelegationTo } from '../../../utils/compareDelegationTo';

type DelegateProps = {
  balance: ethers.BigNumber;
  validator: Validator;
  ownDelegation: boolean;
  onSuccess: () => void;
  onFinish: () => void;
};

const Delegate = ({ balance, validator, ownDelegation, onSuccess, onFinish }: DelegateProps) => {
  const { delegate } = useDelegation();
  const { asyncCallback } = useWalletPopup();

  let maximumDelegatable = '0';
  if (validator.availableForDelegation.gt(balance)) {
    maximumDelegatable = weiToEth(balance);
  } else {
    maximumDelegatable = weiToEth(validator.availableForDelegation);
  }

  const [delegationTotal, setDelegationTotal] = useState<string>(maximumDelegatable.toString());
  const [error, setError] = useState('');

  const delegatePercent = (percentage: number): string => {
    return parseFloat((+maximumDelegatable * (percentage / 100)).toFixed(2)).toString();
  };

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const delegationNumber = parseFloat(delegationTotal);
    if (Number.isNaN(delegationNumber) || delegationNumber < 1000) {
      setError('must be a number greater than 1,000');
      return;
    }

    if (parseFloat(delegationTotal) > parseFloat(ethers.utils.formatEther(balance))) {
      setError('cannot exceed TARA available for delegation');
      return;
    }

    if (parseFloat(delegationTotal) === parseFloat(ethers.utils.formatEther(balance))) {
      setError(
        'Cannot use entire TARA balance. The transaction also requires you pay the gas fee.',
      );
      return;
    }

    if (parseFloat(delegationTotal) > parseFloat(maximumDelegatable)) {
      setError("cannot exceed validator's ability to receive delegation");
      return;
    }

    const delegateValue = ethers.utils.parseUnits(
      delegationNumber.toString().replace(',', '.'),
      18,
    );

    setError('');

    if (!error) {
      asyncCallback(async () => {
        onFinish();
        return await delegate(validator.address, delegateValue);
      }, onSuccess);
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
        <p className="maxDelegatableTotal">{maximumDelegatable}</p>
        <p className="maxDelegatableUnit">TARA</p>
        <InputField
          error={!!error}
          helperText={error}
          label="Enter amount..."
          value={delegationTotal}
          variant="outlined"
          type="number"
          fullWidth
          margin="normal"
          onChange={(event) => {
            setDelegationTotal(event.target.value);
          }}
          onKeyUp={(event) => {
            const inputValue = (event.target as HTMLInputElement).value;
            if (parseFloat(delegationTotal) > parseFloat(ethers.utils.formatEther(balance))) {
              setError('cannot exceed TARA available for delegation');
            } else if (parseFloat(inputValue) === parseFloat(ethers.utils.formatEther(balance))) {
              setError(
                'Cannot use entire TARA balance. The transaction also requires you pay the gas fee.',
              );
            } else if (!ownDelegation && compareDelegationTo(inputValue, '1000')) {
              setError('must be a number greater than 1,000');
            } else {
              setError('');
            }
          }}
        />
        <div className="delegatePercentWrapper">
          <Button
            size="small"
            className="delegatePercent"
            label="25%"
            variant="contained"
            onClick={() => {
              setDelegationTotal(delegatePercent(25));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="50%"
            variant="contained"
            onClick={() => {
              setDelegationTotal(delegatePercent(50));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="75%"
            variant="contained"
            onClick={() => {
              setDelegationTotal(delegatePercent(75));
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
