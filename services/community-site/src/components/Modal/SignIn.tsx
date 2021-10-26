import { useState } from 'react';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';
import { useModal } from '../../services/useModal';
import { useAuth } from '../../services/useAuth';

type SignInProps = {
  onSuccess: () => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
};

const SignIn = ({ onSuccess, onForgotPassword, onCreateAccount }: SignInProps) => {
  const { setIsOpen, setContent } = useModal();
  const auth = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{ key: string; value: string }[]>([]);

  const confirmEmail = async (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    event.preventDefault();
    await auth.emailConfirmation!(username);

    setIsOpen!(true)
    setContent!('sign-up-success');
  };

  const errIndex = errors.map((error) => error.key);
  const errValues = errors.map((error) => error.value);

  const findErrorIndex = (field: string) => errIndex.findIndex((err) => err === field);
  const hasError = (field: string) => findErrorIndex(field) !== -1;

  const hasEmailError = hasError('email');
  const emailErrorMessage = hasError('email') ? errValues[findErrorIndex('email')] : undefined;
  const hasPasswordError = hasError('password');
  const passwordErrorMessage = hasError('password')
    ? errValues[findErrorIndex('password')]
    : undefined;

  let hasGeneralError = false;
  let generalErrorMessage = undefined;

  if (errors.length > 0 && !hasEmailError && !hasPasswordError) {
    hasGeneralError = true;
    generalErrorMessage = errValues[0];
    if (errIndex[0] === "confirmed") {
      generalErrorMessage = (
        <>
          Email not confirmed. <a href="#" className="default-link" onClick={confirmEmail}>Confirm your email</a>
        </>
      );
    }
  }

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrors([]);

    const result = await auth.signin!(username, password);
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
      <Text label="Sign In" variant="h6" color="primary" />
      <form onSubmit={submit}>
        <InputField
          label="E-mail"
          error={hasEmailError}
          helperText={emailErrorMessage}
          placeholder="Email or username..."
          value={username}
          variant="outlined"
          type="text"
          fullWidth
          onChange={(event) => {
            setUsername(event.target.value);
          }}
          margin="normal"
        />
        <InputField
          type="password"
          error={hasPasswordError}
          helperText={passwordErrorMessage}
          label="Password"
          placeholder="Password..."
          value={password}
          variant="outlined"
          fullWidth
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          margin="normal"
        />

        <Text
          id="forgotPasswordLabel"
          onClick={() => onForgotPassword()}
          label="Forgot password?"
          variant="body2"
          color="textSecondary"
        />

        {hasGeneralError && <Text variant="body1" color="error">{generalErrorMessage!}</Text>}

        <Button
          type="submit"
          label="Login"
          color="secondary"
          variant="contained"
          className="marginButton"
          onClick={submit}
          fullWidth
        />
      </form>

      {/* <Button Icon={GoogleIcon} variant="contained" onClick={() => false} className="marginButton bubbleButton" id="bubbleButtonLeft" /> */}
      {/* <Button Icon={BubbleIcon} variant="contained" onClick={() => false} className="marginButton bubbleButton" /> */}

      <Text
        id="noAccountLabel"
        label="Don't have an account yet?"
        variant="body2"
        color="primary"
      />
      <Button
        label="Create an account"
        variant="contained"
        onClick={() => onCreateAccount()}
        fullWidth
        className="marginButton greyButton"
      />
    </div>
  );
};

export default SignIn;
