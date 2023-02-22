/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Button, Text, InputField, Loading, Label } from '@taraxa_project/taraxa-ui';
import { Box, CircularProgress } from '@mui/material';

import useValidators from '../../../services/useValidators';
import { Validator } from '../../../interfaces/Validator';

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
  const [isLoading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const regex =
      /^(ftp|http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?$/;
    if (!regex.test(endpoint)) {
      setError('Endpoint must be a valid url');
      return;
    }
    setError('');
    const payload: any = {
      type,
      description,
      endpoint,
    };

    if (type === 'mainnet') {
      setLoading(true);
      try {
        const res = await setValidatorInfo(
          validator.address,
          payload.description,
          payload.endpoint,
        );
        await res.wait();
        setLoading(false);
        onSuccess();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        setLoading(false);
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
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Label
              variant="loading"
              label="Loading"
              gap
              icon={<CircularProgress size={50} color="inherit" />}
            />
          </Box>
        ) : (
          <Button
            type="submit"
            label="Submit"
            color="secondary"
            variant="contained"
            className="marginButton"
            onClick={submit}
            fullWidth
          />
        )}
      </form>
    </div>
  );
};

export default EditValidator;
