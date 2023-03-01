import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Text, InputField, Loading } from '@taraxa_project/taraxa-ui';

import { useDelegationApi } from '../../../services/useApi';
import useValidators from '../../../services/useValidators';
import SuccessIcon from '../../../assets/icons/success';

const RegisterNode = ({
  balance,
  type,
  onSuccess,
}: {
  balance: ethers.BigNumber;
  type: 'mainnet' | 'testnet';
  onSuccess: () => void;
}) => {
  const minimumRequiredBalance = ethers.utils.parseUnits('1000', 'ether');
  const delegationApi = useDelegationApi();
  const { registerValidator } = useValidators();
  const [step, setStep] = useState(1);
  const [isLoading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [addressProof, setAddressProof] = useState('');
  const [addressProofError, setAddressProofError] = useState('');
  const [vrfKey, setVrfKey] = useState('');
  const [vrfKeyError, setVrfKeyError] = useState('');
  const [commission, setCommission] = useState('');
  const [commissionError, setCommissionError] = useState('');
  const [ip, setIp] = useState('');
  const [ipError, setIpError] = useState('');

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');
    setAddressError('');
    setAddressProofError('');
    setVrfKeyError('');
    setIpError('');
    setCommissionError('');

    if (!address) {
      setAddressError('Node public address is required!');
      return;
    }

    if (!addressProof) {
      setAddressProofError('Proof of ownership is required!');
      return;
    }

    if (!vrfKey) {
      setVrfKeyError('VRF Public Key is required!');
      return;
    }

    const payload: any = {
      type,
      address,
      addressProof,
      vrfKey,
      commission: type === 'mainnet' ? parseInt(commission, 10) : null,
    };

    if (ip) {
      payload.ip = ip;
    }

    if (type === 'mainnet') {
      if (balance.lt(minimumRequiredBalance)) {
        setError('You don`t have enough balance to register a new validator');
        return;
      }

      if (!commission) {
        setCommissionError('Commission is required!');
        return;
      }
      setLoading(true);

      try {
        const res = await registerValidator(
          payload.address,
          payload.addressProof,
          payload.vrfKey,
          payload.commission,
          '',
          '',
        );
        setStep(2);
        await res.wait();
        setLoading(false);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    } else {
      const result = await delegationApi.post(`/nodes`, payload, true);
      if (result.success) {
        onSuccess();
      } else if (Array.isArray(result.response)) {
        const generalErrors = result.response.filter((errMsg) => {
          if (errMsg.startsWith('addressProof')) {
            setAddressProofError(errMsg.slice('addressProof'.length + 1));
            return false;
          }
          if (errMsg.startsWith('vrfKey')) {
            setVrfKeyError(errMsg.slice('vrfKey'.length + 1));
            return false;
          }
          if (errMsg.startsWith('address')) {
            setAddressError(errMsg.slice('address'.length + 1));
            return false;
          }
          if (errMsg.startsWith('commission')) {
            setCommissionError(errMsg.slice('commission'.length + 1));
            return false;
          }
          if (errMsg.startsWith('ip')) {
            setIpError(errMsg.slice('ip'.length + 1));
            return false;
          }

          return true;
        });

        if (generalErrors.length > 0) {
          setError(generalErrors.join(', '));
        }
      } else if (typeof result.response === 'string') {
        if (result.response.includes("doesn't have a profile")) {
          setError('Please setup your profile before registering a node.');
        } else {
          setError(result.response);
        }
      }
    }
  };

  return (
    <>
      {step === 1 ? (
        <div>
          <Text
            style={{
              marginBottom: '2%',
              fontFamily: 'Inter, san-serif',
              fontSize: '18px',
            }}
            label="Register a node"
            variant="h6"
            color="primary"
          />
          <form onSubmit={submit}>
            <InputField
              label="Node public address"
              error={!!addressError}
              helperText={addressError}
              value={address}
              variant="outlined"
              type="text"
              fullWidth
              margin="normal"
              onChange={(event) => {
                setAddress(event.target.value);
              }}
            />
            <InputField
              label="Proof of node ownership"
              error={!!addressProofError}
              helperText={addressProofError}
              value={addressProof}
              variant="outlined"
              type="text"
              fullWidth
              margin="normal"
              onChange={(event) => {
                setAddressProof(event.target.value);
              }}
            />
            <InputField
              label="VRF Public Key"
              error={!!vrfKeyError}
              helperText={vrfKeyError}
              value={vrfKey}
              variant="outlined"
              type="text"
              fullWidth
              margin="normal"
              onChange={(event) => {
                setVrfKey(event.target.value);
              }}
            />
            {type === 'testnet' && (
              <InputField
                label="Node IP (optional)"
                error={!!ipError}
                helperText={ipError}
                value={ip}
                variant="outlined"
                type="text"
                fullWidth
                margin="normal"
                onChange={(event) => {
                  setIp(event.target.value);
                }}
              />
            )}
            {type === 'mainnet' && (
              <InputField
                label="Commission"
                error={!!commissionError}
                helperText={commissionError}
                value={commission}
                variant="outlined"
                type="text"
                fullWidth
                margin="normal"
                onChange={(event) => {
                  setCommission(event.target.value);
                }}
              />
            )}
            {error && (
              <Text variant="body1" color="error">
                {error}
              </Text>
            )}
            <Button
              type="submit"
              label="Submit"
              color="secondary"
              variant="contained"
              className="marginButton"
              onClick={submit}
              fullWidth
            />
          </form>

          <Text style={{ margin: '5% 0' }} label="References:" variant="body1" color="primary" />

          <Button
            label="How to find my node's address?"
            variant="outlined"
            color="secondary"
            className="node-control-reference-button"
            onClick={() =>
              window.open(
                `https://docs.taraxa.io/node-setup/node_address`,
                '_blank',
                'noreferrer noopener',
              )
            }
            fullWidth
          />
          <Button
            label="How to find my node's VRF public key?"
            variant="outlined"
            color="secondary"
            className="node-control-reference-button"
            onClick={() =>
              window.open(
                `https://docs.taraxa.io/node-setup/vrf_key`,
                '_blank',
                'noreferrer noopener',
              )
            }
            fullWidth
          />
          <Button
            label="How do I get the proof of owership?"
            variant="outlined"
            color="secondary"
            className="node-control-reference-button"
            onClick={() =>
              window.open(
                `https://docs.taraxa.io/node-setup/proof_owership`,
                '_blank',
                'noreferrer noopener',
              )
            }
            fullWidth
          />
        </div>
      ) : isLoading ? (
        <div className="delegateNodeModalSuccess">
          <Text
            style={{ marginBottom: '2%' }}
            label="Waiting for confirmation"
            variant="h6"
            color="warning"
          />
          <div className="loadingIcon">
            <Loading />
          </div>
        </div>
      ) : (
        <div className="delegateNodeModalSuccess">
          <Text style={{ marginBottom: '2%' }} label="Success" variant="h6" color="primary" />
          <div className="successIcon">
            <SuccessIcon />
          </div>
          <p className="successText">You've successfully registered a new node</p>
          <Button
            type="button"
            label="Close"
            fullWidth
            color="secondary"
            variant="contained"
            className="marginButton"
            onClick={onSuccess}
          />
        </div>
      )}
    </>
  );
};

export default RegisterNode;
