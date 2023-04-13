import React, { useState } from 'react';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';

import { blocksToDays } from '../../../utils/time';
import { useWalletPopup } from '../../../services/useWalletPopup';
import useValidators from '../../../services/useValidators';

type UpdateCommissionProps = {
  id: number | string;
  currentCommission: number | null;
  onSuccess: () => void;
};

export const VALIDATOR_COMMISSION_CHANGE_FREQUENCY = 116756;

const VALIDATOR_COMMISSION_CHANGE_MAX_DELTA = 5;

const UpdateCommission = ({ id, currentCommission, onSuccess }: UpdateCommissionProps) => {
  const { setCommission: updateCommission } = useValidators();
  const { asyncCallback } = useWalletPopup();

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

    if (
      currentCommission !== null &&
      Math.abs(currentCommission - commissionNumber) > VALIDATOR_COMMISSION_CHANGE_MAX_DELTA
    ) {
      setError(`maximum change is ±${VALIDATOR_COMMISSION_CHANGE_MAX_DELTA}%`);
      return;
    }

    setError('');
    if (commission) {
      asyncCallback(async () => {
        onSuccess();
        return await updateCommission(`${id}`, commissionNumber);
      });
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
          <ol style={{ textAlign: 'left' }}>
            <li key="1">Maximum change cannot exceed ±5% per update.</li>
            <li key="2">
              You will need to wait {VALIDATOR_COMMISSION_CHANGE_FREQUENCY} PBFT blocks(~
              {blocksToDays(VALIDATOR_COMMISSION_CHANGE_FREQUENCY)}) to change it again.
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
