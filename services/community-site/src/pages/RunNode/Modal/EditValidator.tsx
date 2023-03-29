/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Button, Text, InputField, Loading, Label } from '@taraxa_project/taraxa-ui';
import { Box, CircularProgress } from '@mui/material';

import useValidators from '../../../services/useValidators';
import { Validator } from '../../../interfaces/Validator';
import SuccessIcon from '../../../assets/icons/success';
import { useWalletPopup } from '../../../services/useWalletPopup';

const EditValidator = ({
  validator,
  type,
  onSuccess,
}: {
  validator: Validator;
  type: 'mainnet' | 'testnet';
  onSuccess: () => void;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setValidatorInfo } = useValidators();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [description, setDescription] = useState(validator.description || '');
  const [endpoint, setEndpoint] = useState(validator.endpoint || '');
  const [step, setStep] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const { asyncCallback } = useWalletPopup();

  const [error, setError] = useState('');

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const regex =
      /^(ftp|http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?$/;

    if (!regex.test(endpoint)) {
      setError('Website is required and must be a valid url');
      return;
    }
    if (!description) {
      setError('Description is required');
      return;
    }

    setError('');
    const payload: any = {
      type,
      description,
      endpoint,
    };

    if (type === 'mainnet') {
      onSuccess();
      asyncCallback(() =>
        setValidatorInfo(validator.address, payload.description, payload.endpoint),
      );
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
            label="Update Validator"
            variant="h6"
            color="primary"
          />
          <form onSubmit={submit}>
            <InputField
              label="Node operator Website"
              value={endpoint}
              variant="outlined"
              type="text"
              fullWidth
              margin="normal"
              onChange={(event) => {
                setEndpoint(event.target.value);
              }}
            />
            <InputField
              label="Node operator description"
              value={description}
              variant="outlined"
              type="text"
              fullWidth
              margin="normal"
              onChange={(event) => {
                setDescription(event.target.value);
              }}
            />
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
          <p className="successText">Validator updated successfully</p>
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

export default EditValidator;
