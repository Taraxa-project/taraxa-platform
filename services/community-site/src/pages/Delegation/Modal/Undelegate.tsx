import React, { useState, useEffect } from 'react';
import { BigNumber, ethers } from 'ethers';
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
  const [totalDelegation, setTotalDelegation] = useState(ethers.BigNumber.from('0'));
  const [undelegationTotal, setUnDelegationTotal] = useState(ethers.BigNumber.from('0'));
  const [maxUndelegation, setMaxUndelegation] = useState(ethers.BigNumber.from('0'));
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
      setTotalDelegation(delegations[delegationIndex].stake);
      setUnDelegationTotal(delegations[delegationIndex].stake);
    }
  }, [delegations]);

  useEffect(() => {
    if (maxUndelegation.eq(BigNumber.from('0'))) {
      setMaxUndelegation(undelegationTotal);
    }
  }, [totalDelegation]);

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    // const delegationNumber = parseInt(undelegationTotal, 10);
    // if (delegationNumber > totalDelegation) {
    //   setError('cannot exceed TARA available for delegation');
    //   return;
    // }
    setError('');

    asyncCallback(async () => {
      onFinish();
      return await undelegate(validator.address, undelegationTotal);
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
        <p className="maxDelegatableTotal">{ethers.utils.commify(weiToEth(undelegationTotal))}</p>
        <p className="maxDelegatableUnit">TARA</p>
        <InputField
          error={!!error}
          helperText={error}
          label="Enter amount..."
          value={parseInt(weiToEth(undelegationTotal), 10)}
          variant="outlined"
          type="text"
          fullWidth
          margin="normal"
          onChange={(event) => {
            if (
              ethers.BigNumber.from(event.target.value || 0)
                .mul(ethers.BigNumber.from('10').pow(18))
                .gt(maxUndelegation)
            ) {
              setError(`must be a number smaller than or equal to the total current delegation`);
            } else {
              setError('');
            }
            setUnDelegationTotal(
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
              setUnDelegationTotal(totalDelegation.mul(25).div(100));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="50%"
            variant="contained"
            onClick={() => {
              setUnDelegationTotal(totalDelegation.mul(50).div(100));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="75%"
            variant="contained"
            onClick={() => {
              setUnDelegationTotal(totalDelegation.mul(75).div(100));
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
