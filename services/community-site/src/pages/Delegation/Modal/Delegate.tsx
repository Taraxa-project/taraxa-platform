import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Text, InputField, AmountCard, ProfileIcon } from '@taraxa_project/taraxa-ui';
import SuccessIcon from '../../../assets/icons/success';
import { useDelegationApi } from '../../../services/useApi';
import useSigning from '../../../services/useSigning';

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
    <div className="delegateNodeModal">
      {step === 1 ? (
        <>
          <Text
            style={{ marginBottom: '32px', fontSize: '18px' }}
            align="center"
            label="Delegate to..."
            variant="h6"
            color="primary"
          />
          <div className="nodeDescriptor">
            {validatorName && (
              <div className="flexTitle">
                <ProfileIcon title={validatorAddress} backgroundColor="#ffffff" size={20} />
                <p className="nodeName">{validatorName}</p>
              </div>
            )}
            <p className="nodeAddressWrapper">
              <span className="nodeAddress">{validatorAddress}</span>
            </p>
          </div>
          <div className="taraContainerWrapper">
            <div className="taraContainer taraContainerBalance">
              <p className="taraContainerAmountDescription">My available TARA for delegation</p>
              <AmountCard amount={ethers.utils.commify(availableStakingBalance)} unit="TARA" />
            </div>
            <div className="taraContainer">
              <p className="taraContainerAmountDescription">
                Validator’s availability to receive delegation
              </p>
              <AmountCard amount={ethers.utils.commify(remainingDelegation)} unit="TARA" />
            </div>
          </div>
          <div className="taraInputWrapper">
            <p className="maxDelegatableDescription">Maximum delegate-able</p>
            <p className="maxDelegatableTotal">{ethers.utils.commify(maximumDelegatable)}</p>
            <p className="maxDelegatableUnit">TARA</p>
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
            <div className="delegatePercentWrapper">
              <Button
                size="small"
                className="delegatePercent"
                label="25%"
                variant="contained"
                onClick={() => {
                  setDelegationTotal(`${Math.round(0.25 * maximumDelegatable)}`);
                }}
              />
              <Button
                size="small"
                className="delegatePercent"
                label="50%"
                variant="contained"
                onClick={() => {
                  setDelegationTotal(`${Math.round(0.5 * maximumDelegatable)}`);
                }}
              />
              <Button
                size="small"
                className="delegatePercent"
                label="75%"
                variant="contained"
                onClick={() => {
                  setDelegationTotal(`${Math.round(0.75 * maximumDelegatable)}`);
                }}
              />
              <Button
                size="small"
                className="delegatePercent"
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
          <div className="successIcon">
            <SuccessIcon />
          </div>
          <p className="successText">You've successfully delegated to a validator:</p>
          <div className="nodeDescriptor nodeDescriptorSuccess">
            {validatorName && <p className="nodeName">{validatorName}</p>}
            <p className="nodeAddressWrapper">
              <span className="nodeAddress">{validatorAddress}</span>
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
