import { useState } from 'react';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';

import { useApi } from '../../../services/useApi';

type RegisterNodeProps = {
  onSuccess: () => void;
};

const RegisterNode = ({ onSuccess }: RegisterNodeProps) => {
  const api = useApi();

  const [nodePublicAddress, setNodePublicAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [errors, setErrors] = useState<{ key: string; value: string }[]>([]);

  const errIndex = errors.map((error) => error.key);
  const errValues = errors.map((error) => error.value);

  const findErrorIndex = (field: string) => errIndex.findIndex((err) => err === field);
  const hasError = (field: string) => findErrorIndex(field) !== -1;

  const hasAddressError = hasError('address');
  const addressErrorMessage = hasError('address') ? errValues[findErrorIndex('address')] : undefined;
  const hasSignatureError = hasError('signature');
  const signatureErrorMessage = hasError('signature')
    ? errValues[findErrorIndex('signature')]
    : undefined;

  let hasGeneralError = false;
  let generalErrorMessage = undefined;

  if (errors.length > 0 && !hasAddressError && !hasSignatureError) {
    hasGeneralError = true;
    generalErrorMessage = errValues[0];
  }

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrors([]);

    const result = await api.post(`/nodes`, { ethWallet: nodePublicAddress, sig: signature }, true);
    if (result.success) {
      onSuccess();
      return;
    }

    if (typeof result.response === 'string') {
      if (result.response.search(/wallet/i) !== -1) {
        setErrors([{ key: 'address', value: result.response }]);
      } else if (result.response.search(/signature/i) !== -1) {
        setErrors([{ key: 'signature', value: result.response }]);
      } else {
        setErrors([{ key: 'general', value: result.response }]);
      }
    } else {
      setErrors(
        result.response[0].messages.map((message: any) => ({
          key: message.id.split('.')[3],
          value: message.message,
        })),
      );
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
          error={hasAddressError}
          helperText={addressErrorMessage}
          value={nodePublicAddress}
          variant="outlined"
          type="text"
          fullWidth
          margin="normal"
          onChange={(event) => {
            setNodePublicAddress(event.target.value);
          }}
        />
        <InputField
          label="Proof of node ownership"
          error={hasSignatureError}
          helperText={signatureErrorMessage}
          value={signature}
          variant="outlined"
          type="text"
          fullWidth
          margin="normal"
          onChange={(event) => {
            setSignature(event.target.value);
          }}
        />

        {hasGeneralError && <Text variant="body1" color="error">{generalErrorMessage!}</Text>}

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
        fullWidth={true}
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
        fullWidth={true}
      />
    </div>
  );
};

export default RegisterNode;
