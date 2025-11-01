import React, { useState, useContext, createContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { Modal } from '@taraxa_project/taraxa-ui';
import { useAuth } from './useAuth';
import SignIn from '../components/Modal/SignIn';
import EmailConfirmed from '../components/Modal/EmailConfirmed';
import SignUp from '../components/Modal/SignUp';
import SignUpSuccess from '../components/Modal/SignUpSuccess';
import ForgotPassword from '../components/Modal/ForgotPassword';
import ForgotPasswordSuccess from '../components/Modal/ForgotPasswordSuccess';
import ResetPassword from '../components/Modal/ResetPassword';

import CloseIcon from '../assets/icons/close';

type Context = {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  content: string;
  setContent?: (content: string) => void;
  signIn?: () => void;
  reset?: () => void;
  code: string | undefined;
  setCode?: (code: string | undefined) => void;
  modal?: null | JSX.Element;
};

const initialState: Context = {
  isOpen: false,
  content: 'sign-in',
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
  const [content, setContent] = useState('sign-in');
  const [code, setCode] = useState<undefined | string>();

  const signIn = () => {
    setContent('sign-in');
    setIsOpen(true);
  };

  const reset = () => {
    if (isSessionExpired) {
      auth.clearSessionExpired!();
    }
    setContent('sign-in');
    setIsOpen(false);
    setCode(undefined);
    history.push('/');
  };

  let modal: JSX.Element;
  let title: string;

  switch (content) {
    case 'email-confirmed':
      title = 'Create an account';
      modal = (
        <EmailConfirmed
          onSuccess={() => {
            reset!();
          }}
        />
      );
      break;
    case 'sign-up':
      title = 'Create an account';
      modal = (
        <SignUp
          onSuccess={() => {
            // Check if user was auto-logged in (JWT present in localStorage)
            const user = localStorage.getItem('user');
            if (user) {
              const userParsed = JSON.parse(user);
              const isLoggedIn = !!userParsed?.id;
              if (isLoggedIn) {
                // User is auto-confirmed and logged in, close modal
                reset!();
              } else {
                setContent!('sign-up-success');
              }
            } else {
              setContent!('sign-up-success');
            }
          }}
        />
      );
      break;
    case 'sign-up-success':
      title = 'Create an account';
      modal = (
        <SignUpSuccess
          onSuccess={() => {
            reset!();
          }}
        />
      );
      break;
    case 'forgot-password':
      title = 'Forgot password';
      modal = (
        <ForgotPassword
          onSuccess={() => {
            setContent!('forgot-password-success');
          }}
        />
      );
      break;
    case 'forgot-password-success':
      title = 'Forgot password';
      modal = (
        <ForgotPasswordSuccess
          onSuccess={() => {
            reset!();
          }}
        />
      );
      break;
    case 'reset-password':
      title = 'Enter your new password';
      modal = (
        <ResetPassword
          code={code}
          onSuccess={() => {
            reset!();
          }}
        />
      );
      break;
    case 'sign-in':
    default:
      title = 'Sign in';
      modal = (
        <SignIn
          onSuccess={() => {
            setIsOpen!(false);
          }}
          onForgotPassword={() => {
            setContent!('forgot-password');
          }}
          onCreateAccount={() => {
            setContent!('sign-up');
          }}
          isSessionExpired={isSessionExpired}
        />
      );
  }

  return {
    isOpen,
    setIsOpen,
    content,
    setContent,
    code,
    setCode,
    signIn,
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
