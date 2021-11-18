import React, { useState, useContext, createContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { Modal } from '@taraxa_project/taraxa-ui';

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
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('sign-in');
  const [code, setCode] = useState<undefined | string>();

  const signIn = () => {
    setContent('sign-in');
    setIsOpen(true);
  };

  const reset = () => {
    setContent('sign-in');
    setIsOpen(false);
    setCode(undefined);
    history.push('/');
  };

  let modal = (
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
    />
  );

  if (content === 'email-confirmed') {
    modal = (
      <EmailConfirmed
        onSuccess={() => {
          reset!();
        }}
      />
    );
  }

  if (content === 'sign-up') {
    modal = (
      <SignUp
        onSuccess={() => {
          setContent!('sign-up-success');
        }}
      />
    );
  }

  if (content === 'sign-up-success') {
    modal = (
      <SignUpSuccess
        onSuccess={() => {
          reset!();
        }}
      />
    );
  }

  if (content === 'forgot-password') {
    modal = (
      <ForgotPassword
        onSuccess={() => {
          setContent!('forgot-password-success');
        }}
      />
    );
  }

  if (content === 'forgot-password-success') {
    modal = (
      <ForgotPasswordSuccess
        onSuccess={() => {
          reset!();
        }}
      />
    );
  }

  if (content === 'reset-password') {
    modal = (
      <ResetPassword
        code={code}
        onSuccess={() => {
          reset!();
        }}
      />
    );
  }

  modal = (
    <Modal
      id={isMobile ? 'mobile-signinModal' : 'signinModal'}
      title="Test"
      show={isOpen}
      children={modal!}
      parentElementID="root"
      onRequestClose={reset!}
      closeIcon={CloseIcon}
    />
  );

  return {
    isOpen,
    setIsOpen,
    content,
    setContent,
    code,
    setCode,
    signIn,
    reset,
    modal,
  };
}

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const modal = useProvideModal();
  return <ModalContext.Provider value={modal}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
  return useContext(ModalContext);
};
