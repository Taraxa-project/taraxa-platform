import React, { useState } from 'react';
import clsx from 'clsx';
import { ethers } from 'ethers';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';
import SuccessIcon from '../../../assets/icons/success';
import { useDelegationApi } from '../../../services/useApi';
import useSigning from '../../../services/useSigning';

import useStyles from './delegate-styles';

type DelegateProps = {
  validatorId: number;
  validatorName: string;
  validatorAddress: string;
  delegatorAddress: string | null;
  remainingDelegation: number;
  availableStakingBalance: number;
  onSuccess: () => void;
  onFinish: () => void;
};

const Delegate = ({
  validatorId,
  validatorName,
  validatorAddress,
  delegatorAddress,
  remainingDelegation,
  availableStakingBalance,
  onSuccess,
  onFinish,
}: DelegateProps) => {
  const classes = useStyles();
  const maximumDelegatable = Math.min(remainingDelegation, availableStakingBalance);
  const delegationApi = useDelegationApi();
  const sign = useSigning();

  const [step, setStep] = useState(1);
  const [delegationTotal, setDelegationTotal] = useState(`${maximumDelegatable}`);
  const [error, setError] = useState('');

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const delegationNumber = parseInt(delegationTotal, 10);
    if (Number.isNaN(delegationNumber) || delegationNumber < 1000) {
      setError('must be a number greater than 1,000');
      return;
    }

    if (delegationNumber > availableStakingBalance) {
      setError('cannot exceed TARA available for delegation');
      return;
    }
    if (delegationNumber > availableStakingBalance) {
      setError("cannot exceed validator's ability to receive delegation");
      return;
    }

    setError('');

    const nonce = await delegationApi.post(
      '/delegations/nonces',
      { from: delegatorAddress, node: validatorId },
      true,
    );

    const proof = await sign(nonce.response);

    const result = await delegationApi.post(
      '/delegations',
      { proof, from: delegatorAddress, value: delegationNumber, node: validatorId },
      true,
    );

    if (result.success) {
      onSuccess();
      setStep(2);
    }
  };

  return (
    <div>
      {step === 1 ? (
        <>
          <Text
            style={{ marginBottom: '2%' }}
            label="Delegate to..."
            variant="h6"
            color="primary"
          />
          <div className={classes.nodeDescriptor}>
            {validatorName && <p className={classes.nodeName}>{validatorName}</p>}
            <p className={classes.nodeAddressWrapper}>
              <span className={classes.nodeAddress}>{validatorAddress}</span>
            </p>
          </div>
          <div className={classes.taraContainerWrapper}>
            <div className={classes.taraContainer}>
              <p className={classes.taraContainerAmountDescription}>
                My available TARA for delegation
              </p>
              <div className={clsx(classes.taraContainerAmount, classes.taraContainerBalance)}>
                <p className={classes.taraContainerAmountTotal}>
                  {ethers.utils.commify(availableStakingBalance)}
                </p>
                <p className={classes.taraContainerUnit}>TARA</p>
              </div>
            </div>
            <div className={classes.taraContainer}>
              <p className={classes.taraContainerAmountDescription}>
                Validator’s availability to receive delegation
              </p>
              <div className={classes.taraContainerAmount}>
                <p className={classes.taraContainerAmountTotal}>
                  {ethers.utils.commify(remainingDelegation)}
                </p>
                <p className={classes.taraContainerUnit}>TARA</p>
              </div>
            </div>
          </div>
          <div className={classes.taraInputWrapper}>
            <p className={classes.maxDelegatableDescription}>Maximum delegateable</p>
            <p className={classes.maxDelegatableTotal}>
              {ethers.utils.commify(maximumDelegatable)}
            </p>
            <p className={classes.maxDelegatableUnit}>TARA</p>
            <InputField
              error={!!error}
              helperText={error}
              label="Enter amount..."
              value={delegationTotal}
              variant="outlined"
              type="text"
              fullWidth
              margin="normal"
              onChange={(event) => {
                setDelegationTotal(event.target.value);
              }}
            />
            <div className={classes.delegatePercentWrapper}>
              <Button
                size="small"
                className={classes.delegatePercent}
                label="25%"
                variant="contained"
                onClick={() => {
                  setDelegationTotal(`${Math.round(0.25 * maximumDelegatable)}`);
                }}
              />
              <Button
                size="small"
                className={classes.delegatePercent}
                label="50%"
                variant="contained"
                onClick={() => {
                  setDelegationTotal(`${Math.round(0.5 * maximumDelegatable)}`);
                }}
              />
              <Button
                size="small"
                className={classes.delegatePercent}
                label="75%"
                variant="contained"
                onClick={() => {
                  setDelegationTotal(`${Math.round(0.75 * maximumDelegatable)}`);
                }}
              />
              <Button
                size="small"
                className={classes.delegatePercent}
                label="100%"
                variant="contained"
                onClick={() => {
                  setDelegationTotal(`${maximumDelegatable}`);
                }}
              />
            </div>
            <Button
              type="submit"
              label="Delegate"
              color="secondary"
              variant="contained"
              className="marginButton"
              fullWidth
              onClick={submit}
            />
          </div>
        </>
      ) : (
        <>
          <Text style={{ marginBottom: '2%' }} label="Success" variant="h6" color="primary" />
          <div className={classes.successIcon}>
            <SuccessIcon />
          </div>
          <p className={classes.successText}>You've successfully delegated to a validator:</p>
          <div className={clsx(classes.nodeDescriptor, classes.nodeDescriptorSuccess)}>
            {validatorName && <p className={classes.nodeName}>{validatorName}</p>}
            <p className={classes.nodeAddressWrapper}>
              <span className={classes.nodeAddress}>{validatorAddress}</span>
            </p>
          </div>
          <Button
            type="submit"
            label="Ok"
            fullWidth
            color="secondary"
            variant="contained"
            className="marginButton"
            onClick={() => {
              onFinish();
            }}
          />
        </>
      )}
    </div>
  );
};

export default Delegate;
