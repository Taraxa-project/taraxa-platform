import React, { useState } from 'react';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';
import { useHistory } from 'react-router-dom';
import { GreenCircledCheckIconBig } from '../../assets/icons/greenCircularCheck';
import useWalletAuth from '../../services/useWalletAuth';
import WarningCircularIcon from '../../assets/icons/WarningCircular';
import useCMetamask from '../../services/useCMetamask';
import MetamaskIcon from '../../assets/icons/metamask';
import { useModal } from '../../services/useModal';
import { useAuth } from '../../services/useAuth';
import ModalContainer from './subcomponents/ModalContainer';
import ModalText from './subcomponents/ModalText';

type SignInProps = {
  onSuccess: () => void;
  onForgotPassword: () => void;
  isSessionExpired: boolean;
  isWalletRegistration?: boolean;
};

const SignIn = ({
  onSuccess,
  onForgotPassword,
  isSessionExpired,
  isWalletRegistration,
}: SignInProps) => {
  const { setIsOpen, setContent } = useModal();
  const auth = useAuth();
  const { account } = useCMetamask();
  const { isAuthorized, authorizeAddress } = useWalletAuth();
  const history = useHistory();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isMMRegistration, setMMRegistration] = useState(isWalletRegistration || false);
  const [errors, setErrors] = useState<{ key: string; value: string }[]>([]);

  const confirmEmail = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    await auth.emailConfirmation!(username);

    setIsOpen!(true);
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
  let generalErrorMessage: any;
  if (errors.length > 0 && !hasEmailError && !hasPasswordError) {
    hasGeneralError = true;
    generalErrorMessage = errValues[0];
    if (errIndex[0] === 'confirmed') {
      generalErrorMessage = (
        <>
          Email not confirmed.{' '}
          <a href="#" className="default-link" onClick={confirmEmail}>
            Confirm your email
          </a>
        </>
      );
    }
  }

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (isSessionExpired) {
      auth.clearSessionExpired!();
    }

    setErrors([]);

    const result = await auth.signin!(username, password);
    if (result.success) {
      if (isAuthorized) {
        onSuccess();
        return;
      }
    }

    setErrors(
      result.response[0].messages.map((message: any) => ({
        key: message.id.split('.')[3],
        value: message.message,
      })),
    );
  };

  const registerMM = async () => {
    if (!account) return;
    await authorizeAddress();
    setMMRegistration(isAuthorized);
  };

  return (
    <ModalContainer>
      {isMMRegistration ? (
        isAuthorized ? (
          <>
            <Text label="Success!" variant="h6" color="primary" style={{ marginBottom: '12%' }} />
            <GreenCircledCheckIconBig />
            <ModalText
              marginTop="7%"
              marginBottom="7%"
              text="Your account is successfully validated."
            />
            <Button
              type="submit"
              label="Go to my account"
              color="secondary"
              variant="contained"
              className="marginButton"
              onClick={() => {
                history.push('/profile');
                onSuccess();
              }}
              fullWidth
            />
          </>
        ) : (
          <>
            <Text variant="h6" color="primary" style={{ marginBottom: '12%' }}>
              SUCCESSFUL LOGIN
            </Text>
            <WarningCircularIcon color="#878CA4" />
            <ModalText marginTop="7%" marginBottom="7%" text="Verify your wallet" />
            <ModalText
              marginTop="7%"
              marginBottom="7%"
              text="You don’t have verified wallet. Please go to your account and verify your wallet."
            />
            <ModalText
              marginTop="7%"
              marginBottom="7%"
              color="#FF515A"
              text="Email / password logins will be retired soon."
            />
            <Button
              type="submit"
              label="Verify via Metamask"
              Icon={MetamaskIcon}
              color="secondary"
              variant="contained"
              className="marginButton"
              onClick={submit}
              fullWidth
            />
          </>
        )
      ) : (
        <>
          <Text label="Sign in" variant="h6" color="primary" />
          {isSessionExpired && (
            <Text variant="body1" color="error">
              Your session expired. Please sign in again.
            </Text>
          )}
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

            {hasGeneralError && (
              <Text variant="body1" color="error">
                {generalErrorMessage!}
              </Text>
            )}

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
            label="Create an account using MetaMask"
            variant="contained"
            onClick={() => registerMM()}
            fullWidth
            Icon={MetamaskIcon}
            className="marginButton greyButton"
          />
        </>
      )}
    </ModalContainer>
  );
};

export default SignIn;
