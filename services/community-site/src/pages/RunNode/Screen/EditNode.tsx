/* eslint-disable no-console */
import React, { useState } from 'react';
import { Text, Button, InputField } from '@taraxa_project/taraxa-ui';
import Title from '../../../components/Title/Title';
import { useDelegationApi } from '../../../services/useApi';
import useStyles from './editnode-styles';

interface Node {
  id: number;
  name: string;
  address: string;
  ip: string;
  active: boolean;
  type: 'mainnet' | 'testnet';
  commissions: any[];
  rank: string;
}

interface EditNodeProps {
  closeEditNode: (refreshNodes: boolean) => void;
  node: Node;
}

const EditNode = ({ closeEditNode, node }: EditNodeProps) => {
  const classes = useStyles();
  const [name, setName] = useState(node.name || '');
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
    const result = await delegationApi.put(`/nodes/${node.id}`, { name, ip }, true);

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
    <>
      <Title title="Edit node" />
      <p className={classes.editNodeAddressWrapper}>
        <span className={classes.editNodeAddress}>{node.address}</span>
      </p>
      <form onSubmit={submit}>
        <div className="editProfileForm">
          <div className="formInputContainer">
            <div>
              <Text
                className="profile-inputLabel"
                label="Node name (optional)"
                variant="body2"
                color="primary"
              />
              <InputField
                error={!!nameError}
                helperText={nameError}
                type="string"
                className="profileInput"
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
          </div>
          <div className="formInputContainer">
            <div>
              <Text
                className="profile-inputLabel"
                label="Node IP (optional)"
                variant="body2"
                color="primary"
              />
              <InputField
                error={!!ipError}
                helperText={ipError}
                type="string"
                className="profileInput"
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
        </div>
        <div id="buttonsContainer">
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
    </>
  );
};

export type { Node };
export default EditNode;
