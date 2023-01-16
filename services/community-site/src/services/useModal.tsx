import React, { useState, useContext, createContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { Modal } from '@taraxa_project/taraxa-ui';
import VerifyWallet from '../components/Modal/VerifyWallet';
import WalletSignIn from '../components/Modal/WalletSignIn';
import Preset from '../components/Modal/Preset';
import { useAuth } from './useAuth';
import SignIn from '../components/Modal/SignIn';
import EmailConfirmed from '../components/Modal/EmailConfirmed';
import SignUp from '../components/Modal/SignUp';
import SignUpSuccess from '../components/Modal/SignUpSuccess';
import ForgotPassword from '../components/Modal/ForgotPassword';
import ForgotPasswordSuccess from '../components/Modal/ForgotPasswordSuccess';
import ResetPassword from '../components/Modal/ResetPassword';

import CloseIcon from '../assets/icons/close';

type LoginContentTypes =
  | 'preset'
  | 'mm-sign-in'
  | 'sign-in'
  | 'sign-up'
  | 'sign-up-success'
  | 'forgot-password'
  | 'forgot-password-success'
  | 'email-confirmed'
  | 'reset-password'
  | 'verify-wallet';

type Context = {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  content: LoginContentTypes;
  setContent?: (content: LoginContentTypes) => void;
  signIn?: () => void;
  authorizeWallet?: () => void;
  reset?: () => void;
  code: string | undefined;
  setCode?: (code: string | undefined) => void;
  modal?: null | JSX.Element;
};

const initialState: Context = {
  isOpen: false,
  content: 'preset',
  code: undefined,
  modal: null,
};

const ModalContext = createContext<Context>(initialState);

function useProvideModal() {
  const history = useHistory();
  const auth = useAuth();
  const isSessionExpired = auth.isSessionExpired!;
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const [isOpen, setIsOpen] = useState(isSessionExpired);
  const [content, setContent] = useState<LoginContentTypes>('preset');
  const [title, setTitle] = useState<string>('Sign in / Sign up');
  const [modal, setModal] = useState<JSX.Element>(
    <Preset
      onMM={() => setContent!('mm-sign-in')}
      onClassic={() => setContent!('sign-in')}
      onSuccess={() => setIsOpen(false)}
    />,
  );
  const [code, setCode] = useState<undefined | string>();

  const authorizeWallet = () => {
    setContent('verify-wallet');
    setTitle('IMPORTANT NOTICE');
    setIsOpen(true);
  };

  const signIn = () => {
    setContent('preset');
    setTitle('Sign in / Sign up');
    setIsOpen(true);
  };

  const reset = () => {
    if (isSessionExpired) {
      auth.clearSessionExpired!();
    }
    setContent('preset');
    setTitle('Sign in / Sign up');
    setIsOpen(false);
    setCode(undefined);
    history.push('/');
  };

  useEffect(() => {
    switch (content) {
      case 'preset':
        setTitle('Sign in');
        setModal(
          <Preset
            onMM={() => setContent!('mm-sign-in')}
            onClassic={() => setContent!('sign-in')}
            onSuccess={() => setIsOpen(false)}
          />,
        );
        break;
      case 'mm-sign-in':
        setTitle('Sign in / Sign up');
        setModal(<WalletSignIn isSigning onClassic={() => setContent!('sign-in')} />);
        break;
      case 'verify-wallet':
        setTitle('IMPORTANT NOTICE');
        setModal(<VerifyWallet onSuccess={() => setIsOpen(false)} />);
        break;
      case 'email-confirmed':
        setTitle('Create an account');
        setModal(
          <EmailConfirmed
            onSuccess={() => {
              reset!();
            }}
          />,
        );
        break;
      case 'sign-up':
        setTitle('Create an account');
        setModal(
          <SignUp
            onSuccess={() => {
              setContent!('sign-up-success');
            }}
          />,
        );
        break;
      case 'sign-up-success':
        setTitle('Create an account');
        setModal(
          <SignUpSuccess
            onSuccess={() => {
              reset!();
            }}
          />,
        );
        break;
      case 'forgot-password':
        setTitle('Forgot password');
        setModal(
          <ForgotPassword
            onSuccess={() => {
              setContent!('forgot-password-success');
            }}
          />,
        );
        break;
      case 'forgot-password-success':
        setTitle('Forgot password');
        setModal(
          <ForgotPasswordSuccess
            onSuccess={() => {
              reset!();
            }}
          />,
        );
        break;
      case 'reset-password':
        setTitle('Enter your new password');
        setModal(
          <ResetPassword
            code={code}
            onSuccess={() => {
              reset!();
            }}
          />,
        );
        break;
      case 'sign-in':
      default:
        setTitle('Sign in');
        setModal(
          <SignIn
            onSuccess={() => {
              setIsOpen(false);
            }}
            onForgotPassword={() => {
              setContent!('forgot-password');
            }}
            isSessionExpired={isSessionExpired}
          />,
        );
    }
  }, [content]);

  return {
    isOpen,
    setIsOpen,
    content,
    setContent,
    code,
    setCode,
    signIn,
    authorizeWallet,
    reset,
    modal: (
      <Modal
        id={isMobile ? 'mobile-signinModal' : 'signinModal'}
        title={title}
        show={isOpen}
        children={modal!}
        parentElementID="root"
        onRequestClose={reset!}
        closeIcon={CloseIcon}
      />
    ),
  };
}

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const modal = useProvideModal();
  return <ModalContext.Provider value={modal}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
  return useContext(ModalContext);
};
