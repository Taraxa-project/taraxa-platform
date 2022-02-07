import React, { useEffect, useState } from 'react';
import { useMetaMask } from 'metamask-react';
import { ethers } from 'ethers';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';
import SuccessIcon from '../../../assets/icons/success';
import { useDelegationApi } from '../../../services/useApi';
import useSigning from '../../../services/useSigning';

type UndelegateProps = {
  validatorId: number;
  validatorName: string;
  validatorAddress: string;
  onSuccess: () => void;
  onFinish: () => void;
};

const Undelegate = ({
  validatorId,
  validatorName,
  validatorAddress,
  onSuccess,
  onFinish,
}: UndelegateProps) => {
  const [undelegationTotal, setUnDelegationTotal] = useState(``);
  const [totalDelegation, setTotalDelegation] = useState(0);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const delegationApi = useDelegationApi();
  const { account } = useMetaMask();
  const sign = useSigning();

  const getBalance = async () => {
    const balance = await delegationApi.get(`/delegations/${account}/balances/${validatorId}`);
    setTotalDelegation(balance.response.undelegatable);
  };

  useEffect((): void => {
    getBalance();
  }, []);

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const delegationNumber = parseInt(undelegationTotal, 10);
    if (delegationNumber > totalDelegation) {
      setError('cannot exceed TARA available for delegation');
      return;
    }
    setError('');

    const nonce = await delegationApi.post(
      '/undelegations/nonces',
      { from: account, node: validatorId },
      true,
    );

    const proof = await sign(nonce.response);

    const result = await delegationApi.post(
      '/undelegations',
      { proof, from: account, value: delegationNumber, node: validatorId },
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
            label="Undelegate from..."
            align="center"
            variant="h6"
            color="primary"
          />
          <div className="nodeDescriptor">
            {validatorName && <p className="nodeName">{validatorName}</p>}
            <p className="nodeAddressWrapper">
              <span className="nodeAddress">{validatorAddress}</span>
            </p>
          </div>
          <div className="taraInputWrapper">
            <p className="maxDelegatableDescription">Available to undelegate</p>
            <p className="maxDelegatableTotal">{ethers.utils.commify(totalDelegation)}</p>
            <p className="maxDelegatableUnit">TARA</p>
            <InputField
              error={!!error}
              helperText={error}
              label="Enter amount..."
              value={undelegationTotal}
              variant="outlined"
              type="text"
              fullWidth
              margin="normal"
              onChange={(event) => {
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
                  setUnDelegationTotal(`${Math.round(0.25 * totalDelegation)}`);
                }}
              />
              <Button
                size="small"
                className="delegatePercent"
                label="50%"
                variant="contained"
                onClick={() => {
                  setUnDelegationTotal(`${Math.round(0.5 * totalDelegation)}`);
                }}
              />
              <Button
                size="small"
                className="delegatePercent"
                label="75%"
                variant="contained"
                onClick={() => {
                  setUnDelegationTotal(`${Math.round(0.75 * totalDelegation)}`);
                }}
              />
              <Button
                size="small"
                className="delegatePercent"
                label="100%"
                variant="contained"
                onClick={() => {
                  setUnDelegationTotal(`${totalDelegation}`);
                }}
              />
            </div>
            <Button
              type="submit"
              label="Un-Delegate"
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
          <p className="successText">
            You've successfully undelegated {ethers.utils.commify(undelegationTotal)} TARA from
            validator:
          </p>
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

export default Undelegate;
