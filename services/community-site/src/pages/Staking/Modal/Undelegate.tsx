import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';

import useDelegation from '../../../services/useDelegation';
import useCMetamask from '../../../services/useCMetamask';

import { weiToEth } from '../../../utils/eth';
import { Validator } from '../../../interfaces/Validator';
import Delegation from '../../../interfaces/Delegation';
import { useWalletPopup } from '../../../services/useWalletPopup';

type UndelegateProps = {
  validator: Validator;
  onSuccess: () => void;
  onFinish: () => void;
};

const Undelegate = ({ validator, onSuccess, onFinish }: UndelegateProps) => {
  const { getDelegations, undelegate } = useDelegation();
  const { status, account } = useCMetamask();
  const { asyncCallback } = useWalletPopup();

  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [totalDelegation, setTotalDelegation] = useState('0');
  const [undelegationTotal, setUnDelegationTotal] = useState('0');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'connected' && account) {
      (async () => {
        setDelegations(await getDelegations(account));
      })();
    }
  }, [status, account]);

  useEffect(() => {
    const delegationIndex = delegations.findIndex(
      (d: Delegation) => d.address.toLowerCase() === validator.address.toLowerCase(),
    );
    if (delegationIndex !== -1) {
      setTotalDelegation(weiToEth(delegations[delegationIndex].stake));
      setUnDelegationTotal(weiToEth(delegations[delegationIndex].stake));
    }
  }, [delegations]);

  const delegatePercent = (percentage: number): string => {
    return parseFloat((+totalDelegation * (percentage / 100)).toFixed(2)).toString();
  };

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (parseFloat(undelegationTotal) > parseFloat(totalDelegation)) {
      setError('cannot exceed TARA available for delegation');
      return;
    }

    setError('');

    const undelegateValue = ethers.BigNumber.from(parseFloat(undelegationTotal)).mul(
      ethers.BigNumber.from(10).pow(ethers.BigNumber.from(18)),
    );

    asyncCallback(async () => {
      onFinish();
      return await undelegate(validator.address, undelegateValue);
    }, onSuccess);
  };

  return (
    <div className="delegateNodeModal">
      <Text
        style={{ marginBottom: '32px', fontSize: '18px' }}
        label="Undelegate from..."
        align="center"
        variant="h6"
        color="primary"
      />
      <div className="nodeDescriptor">
        <p className="nodeAddressWrapper">
          <span className="nodeAddress">{validator.address}</span>
        </p>
      </div>
      <div className="taraInputWrapper">
        <p className="maxDelegatableDescription">Available to undelegate</p>
        <p className="maxDelegatableTotal">{totalDelegation}</p>
        <p className="maxDelegatableUnit">TARA</p>
        <InputField
          error={!!error}
          helperText={error}
          label="Enter amount..."
          value={undelegationTotal}
          variant="outlined"
          type="number"
          fullWidth
          margin="normal"
          onChange={(event) => {
            if (parseFloat(event.target.value) > parseFloat(totalDelegation)) {
              setError(`must be a number smaller than or equal to the total current delegation`);
            } else {
              setError('');
            }
            setUnDelegationTotal(event.target.value);
          }}
        />
        <div className="delegatePercentWrapper">
          <Button
            size="small"
            className="delegatePercent"
            label="25%"
            variant="contained"
            onClick={() => {
              setUnDelegationTotal(delegatePercent(25));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="50%"
            variant="contained"
            onClick={() => {
              setUnDelegationTotal(delegatePercent(50));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="75%"
            variant="contained"
            onClick={() => {
              setUnDelegationTotal(delegatePercent(75));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="100%"
            variant="contained"
            onClick={() => {
              setUnDelegationTotal(totalDelegation);
            }}
          />
        </div>
        <Button
          type="submit"
          label="Un-Delegate"
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

export default Undelegate;
