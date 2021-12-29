import React, { useState } from 'react';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';

import { useDelegationApi } from '../../../services/useApi';

type UpdateNodeProps = {
  id: number;
  name: string;
  ip: string;
};

const UpdateNode = ({ id, name, ip }: UpdateNodeProps) => {
  const delegationApi = useDelegationApi();

  const [nodeName, setNodeName] = useState(name);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [nodeIp, setNodeIp] = useState(ip);
  const [ipError, setIpError] = useState<string | undefined>(undefined);

  const submitName = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setNameError(undefined);

    const result = await delegationApi.put(`/nodes/${id}`, { name: nodeName }, true);
    if (!result.success) {
      setNameError(typeof result.response === 'string' ? result.response : undefined);
    }
  };

  const submitIp = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setIpError(undefined);

    const result = await delegationApi.put(`/nodes/${id}`, { ip: nodeIp }, true);
    if (!result.success) {
      setIpError(typeof result.response === 'string' ? result.response : undefined);
    }
  };

  return (
    <div>
      <Text style={{ marginBottom: '2%' }} label="Update node" variant="h6" color="primary" />
      <InputField
        label="Node name"
        error={nameError !== undefined}
        helperText={nameError}
        value={nodeName}
        variant="outlined"
        type="text"
        fullWidth
        margin="normal"
        onChange={(event) => {
          setNodeName(event.target.value);
        }}
      />
      <Button
        type="submit"
        label="Save name"
        color="secondary"
        variant="contained"
        className="marginButton"
        onClick={submitName}
      />
      <InputField
        label="Node IP"
        error={ipError !== undefined}
        helperText={ipError}
        value={nodeIp}
        variant="outlined"
        type="text"
        fullWidth
        margin="normal"
        onChange={(event) => {
          setNodeIp(event.target.value);
        }}
      />
      <Button
        type="submit"
        label="Save name"
        color="secondary"
        variant="contained"
        className="marginButton"
        onClick={submitIp}
      />
    </div>
  );
};

export default UpdateNode;
