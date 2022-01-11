import React, { useState } from 'react';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';

import { useDelegationApi } from '../../../services/useApi';

type UpdateCommissionProps = {
  id: number;
  currentCommission: number | null;
  onSuccess: () => void;
};

const UpdateCommission = ({ id, currentCommission, onSuccess }: UpdateCommissionProps) => {
  const delegationApi = useDelegationApi();

  const [step, setStep] = useState(1);
  const [commission, setCommission] = useState('');
  const [error, setError] = useState('');

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const commissionNumber = parseInt(commission, 10);
    if (Number.isNaN(commissionNumber) || commissionNumber > 100 || commissionNumber < 0) {
      setError('must be an number between 0% and 100%');
      return;
    }

    if (currentCommission !== null && Math.abs(currentCommission - commissionNumber) > 5) {
      setError('maximum change is ±5%');
      return;
    }

    setError('');

    const result = await delegationApi.post(
      `/nodes/${id}/commissions`,
      { commission: commissionNumber },
      true,
    );

    if (result.success) {
      onSuccess();
      return;
    }

    if (
      typeof result.response === 'string' &&
      result.response.includes('already has a pending commission change')
    ) {
      setError('this node already has a pending commission change');
    }
  };

  return (
    <div>
      <Text style={{ marginBottom: '2%' }} label="Change commission" variant="h6" color="primary" />
      {step === 1 ? (
        <>
          <p>
            <strong>Notice</strong>
          </p>
          <ol>
            <li key="1">Maximum change cannot exceed ±5% per update.</li>
            <li key="2">
              Actual change of the comission will take place 5 days after your update.
            </li>
            <li key="3">
              All of your delegators will be notified that you have changed the comission.
            </li>
          </ol>
          <Button
            type="submit"
            label="Proceed to change commission"
            color="secondary"
            variant="contained"
            className="marginButton"
            onClick={() => {
              setStep(2);
            }}
          />
        </>
      ) : (
        <>
          <InputField
            error={!!error}
            helperText={error}
            label="Your new commission value"
            placeholder={
              currentCommission !== null ? `Your current commission is ${currentCommission}%` : ''
            }
            value={commission}
            variant="outlined"
            type="text"
            fullWidth
            margin="normal"
            onChange={(event) => {
              setCommission(event.target.value);
            }}
          />
          <Button
            type="submit"
            label="Send request to change commission"
            color="secondary"
            variant="contained"
            className="marginButton"
            onClick={submit}
          />
        </>
      )}
    </div>
  );
};

export default UpdateCommission;
