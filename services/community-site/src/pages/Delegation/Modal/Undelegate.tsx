import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';

type UndelegateProps = {
  validatorName: string;
  validatorAddress: string;
  totalDelegation: number;
  onSuccess: () => void;
};

const Undelegate = ({
  validatorName,
  validatorAddress,
  totalDelegation,
  onSuccess,
}: UndelegateProps) => {
  const [undelegationTotal, setUnDelegationTotal] = useState(``);
  const [error] = useState('');

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    onSuccess();
  };

  return (
    <div className="delegateNodeModal">
      <Text
        style={{ marginBottom: '2%' }}
        label="Undelegate from..."
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
    </div>
  );
};

export default Undelegate;
