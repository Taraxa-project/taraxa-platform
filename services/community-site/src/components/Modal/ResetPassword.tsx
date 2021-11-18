import React, { useState } from 'react';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';
import { useAuth } from '../../services/useAuth';

const ResetPassword = ({
  code,
  onSuccess,
}: {
  code: string | undefined;
  onSuccess: () => void;
}) => {
  const auth = useAuth();

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [errors, setErrors] = useState<{ key: string; value: string }[]>([]);

  const errIndex = errors.map((error) => error.key);
  const errValues = errors.map((error) => error.value);

  const findErrorIndex = (field: string) => errIndex.findIndex((err) => err === field);
  const hasError = (field: string) => findErrorIndex(field) !== -1;

  const hasPasswordError = hasError('password');
  const passwordErrorMessage = hasError('password')
    ? errValues[findErrorIndex('password')]
    : undefined;
  const hasPasswordConfirmationError = hasError('password-confirmation');
  const passwordConfirmationErrorMessage = hasError('password-confirmation')
    ? errValues[findErrorIndex('password-confirmation')]
    : undefined;

  let hasGeneralError = false;
  let generalErrorMessage: any;

  if (errors.length > 0 && !hasPasswordError && !hasPasswordConfirmationError) {
    hasGeneralError = true;
    generalErrorMessage = errValues[0];
  }

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrors([]);
    const errors = [];

    if (password.length < 12) {
      errors.push({
        key: 'password',
        value: 'The password needs to have at least 12 characters.',
      });
    }

    if (password !== passwordConfirmation) {
      errors.push({
        key: 'password-confirmation',
        value: 'Passwords do not match.',
      });
    }

    if (errors.length > 0) {
      setErrors(errors);
      return;
    }

    const result = await auth.resetPassword!(code!, password, passwordConfirmation);

    if (result.success) {
      onSuccess();
      return;
    }

    setErrors(
      result.response[0].messages.map((message: any) => ({
        key: message.id.split('.')[3],
        value: message.message,
      })),
    );
  };

  return (
    <div>
      <Text label="Enter your new password" variant="h6" color="primary" />
      <Text label="Please, enter a new password." variant="body2" color="textSecondary" />

      <form onSubmit={submit}>
        <InputField
          type="password"
          error={hasPasswordError}
          helperText={passwordErrorMessage}
          label="New password"
          placeholder="New password..."
          value={password}
          variant="outlined"
          fullWidth
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          margin="normal"
        />
        <InputField
          type="password"
          error={hasPasswordConfirmationError}
          helperText={passwordConfirmationErrorMessage}
          label="Repeat new password"
          placeholder="Repeat new password..."
          value={passwordConfirmation}
          variant="outlined"
          fullWidth
          onChange={(event) => {
            setPasswordConfirmation(event.target.value);
          }}
          margin="normal"
        />

        {hasGeneralError && <Text label={generalErrorMessage!} variant="body1" color="error" />}

        <Button
          type="submit"
          label="Reset Password"
          color="secondary"
          variant="contained"
          className="marginButton"
          onClick={submit}
          fullWidth
        />
      </form>
    </div>
  );
};

export default ResetPassword;
