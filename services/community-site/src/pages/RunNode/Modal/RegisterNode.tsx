import React, { useState } from 'react';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';

import { useDelegationApi } from '../../../services/useApi';

type RegisterNodeProps = {
  onSuccess: () => void;
  type: 'mainnet' | 'testnet';
};

const RegisterNode = ({ onSuccess, type }: RegisterNodeProps) => {
  const delegationApi = useDelegationApi();

  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [addressProof, setAddressProof] = useState('');
  const [addressProofError, setAddressProofError] = useState('');
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
    setIpError('');
    setCommissionError('');

    const result = await delegationApi.post(
      `/nodes`,
      {
        address,
        addressProof,
        ip,
        type,
        commission: type === 'mainnet' ? parseInt(commission, 10) : null,
      },
      true,
    );

    if (result.success) {
      onSuccess();
    } else if (Array.isArray(result.response)) {
      const generalErrors = result.response.filter((errMsg) => {
        if (errMsg.startsWith('addressProof')) {
          setAddressProofError(errMsg.slice('addressProof'.length + 1));
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
  };

  return (
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
          label="IP address"
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
  );
};

export default RegisterNode;
