import React, { useState } from 'react';
import { Text, Button, InputField } from '@taraxa_project/taraxa-ui';
import Title from '../../../components/Title/Title';
import { useDelegationApi } from '../../../services/useApi';
import { Validator } from '../../../interfaces/Validator';

interface EditNodeProps {
  closeEditNode: (refreshNodes: boolean) => void;
  node: Validator;
}

const EditNode = ({ closeEditNode, node }: EditNodeProps) => {
  const [name, setName] = useState(node.description || '');
  const [nameError, setNameError] = useState('');
  const [ip, setIp] = useState(node.ip || '');
  const [ipError, setIpError] = useState('');
  const delegationApi = useDelegationApi();

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setNameError('');
    setIpError('');
    const result = await delegationApi.put(
      `/nodes/${node.id}`,
      { name: name || null, ip: ip || null },
      true,
    );

    if (result.success) {
      closeEditNode(true);
      return;
    }

    if (Array.isArray(result.response)) {
      result.response.forEach((errMsg) => {
        if (errMsg.startsWith('name')) {
          setNameError(errMsg.slice('name'.length + 1));
        }
        if (errMsg.startsWith('ip')) {
          setIpError(errMsg.slice('ip'.length + 1));
        }
      });
    }
  };

  return (
    <div className="editNodeScreen">
      <Title
        title={
          <p>
            Edit node{' '}
            <span style={{ wordBreak: 'break-all', fontSize: '25px' }}>{node.address}</span>
          </p>
        }
      />
      <form onSubmit={submit}>
        <div className="detailsForm">
          <div className="inputContainer">
            <Text
              className="detailsFormLabel"
              label="Node name (optional)"
              variant="body2"
              color="primary"
            />
            <InputField
              error={!!nameError}
              helperText={nameError}
              type="string"
              className="detailsFormInput"
              label=""
              color="secondary"
              value={name}
              variant="standard"
              onChange={(event: any) => {
                setName(event.target.value);
              }}
              margin="normal"
            />
          </div>
          <div className="inputContainer">
            <Text
              className="detailsFormLabel"
              label="Node IP (optional)"
              variant="body2"
              color="primary"
            />
            <InputField
              error={!!ipError}
              helperText={ipError}
              type="string"
              className="detailsFormInput"
              label=""
              color="secondary"
              value={ip}
              variant="standard"
              onChange={(event: any) => {
                setIp(event.target.value);
              }}
              margin="normal"
            />
          </div>
        </div>
        <div id="detailsFormButtonsContainer">
          <Button
            type="submit"
            label="Save changes"
            variant="contained"
            color="secondary"
            onClick={submit}
          />
          <Button
            label="Cancel"
            variant="contained"
            id="grayButton"
            onClick={() => {
              closeEditNode(false);
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default EditNode;
