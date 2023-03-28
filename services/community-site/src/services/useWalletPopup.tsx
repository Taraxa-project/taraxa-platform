/* eslint-disable @typescript-eslint/no-unused-vars */
import { Text, Modal, Loading, Button } from '@taraxa_project/taraxa-ui';
import { ethers } from 'ethers';
import React, { useState, useContext, createContext } from 'react';
import { useMediaQuery } from 'react-responsive';
import CloseIcon from '../assets/icons/close';
import ErrorIcon from '../assets/icons/error';
import InfoIcon from '../assets/icons/info';
import SuccessIcon from '../assets/icons/success';
import WalletIcon from '../assets/icons/wallet';

export enum WalletPopupState {
  DEFAULT = 'default',
  ACTION = 'action',
  LOADING = 'loading',
  ERROR = 'error',
  SUCCESS = 'success',
}

type AsyncCallbackType = (...args: any[]) => Promise<ethers.providers.TransactionResponse>;

type Context = {
  state: WalletPopupState;
  showPopup: boolean;
  isMobile: boolean;
  modalTitle: string;
  modalContent: JSX.Element | null;
  asyncCallback: (callback: AsyncCallbackType, args: any[]) => Promise<void>;
};

const initialState: Context = {
  state: WalletPopupState.DEFAULT,
  showPopup: false,
  isMobile: false,
  modalTitle: '',
  modalContent: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  asyncCallback: async (callback, args) => {
    try {
      const response = await callback(...args);
      return;
    } catch (error) {
      throw new Error('Something went wrong');
    }
  },
};

const WalletPopupContext = createContext<Context>(initialState);

const useProvideWalletPopup = () => {
  const [state, setState] = useState<WalletPopupState>(WalletPopupState.DEFAULT);
  const [showPopup, setShowPopup] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>('Please check your wallet');
  const [modalContent, setModalContent] = useState<JSX.Element>(<h2>Something</h2>);
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  const handleClose = () => {
    setShowPopup(false);
  };

  const changeState = (state: WalletPopupState, title?: string, message?: string): void => {
    setState(state);
    setShowPopup(true);
    let modalTitle: string;
    let modalContent: JSX.Element;
    switch (state) {
      case WalletPopupState.ACTION:
        modalTitle = title || 'Metamask action required';
        modalContent = (
          <div className="delegateNodeModalSuccess">
            <Text
              style={{ marginBottom: '2%' }}
              label={message || 'Action required'}
              variant="h6"
            />
            <div className="loadingIcon">
              <WalletIcon />
            </div>
            <p className="successText" style={{ wordBreak: 'break-all' }}>
              Please check your Wallet!
            </p>
          </div>
        );
        setModalTitle(modalTitle);
        setModalContent(modalContent);
        return;
      case WalletPopupState.LOADING:
        modalTitle = title || 'Loading';
        modalContent = (
          <div className="delegateNodeModalSuccess">
            <Text
              style={{ marginBottom: '2%' }}
              label={message || 'Waiting for confirmation'}
              variant="h6"
              color="warning"
            />
            <div className="loadingIcon">
              <Loading />
            </div>
            <p className="successText" style={{ wordBreak: 'break-all' }}>
              Please wait until the action is performed
            </p>
          </div>
        );
        setModalTitle(modalTitle);
        setModalContent(modalContent);
        return;
      case WalletPopupState.ERROR:
        modalTitle = title || 'Error';
        modalContent = (
          <div className="delegateNodeModalSuccess">
            <Text
              style={{ marginBottom: '2%' }}
              label={title || 'Error'}
              variant="h6"
              color="primary"
            />
            <div className="successIcon">
              <ErrorIcon />
            </div>
            <p className="successText" style={{ wordBreak: 'break-all' }}>
              {message || 'An error occurred'}
            </p>
            <Button
              type="button"
              label="Close"
              fullWidth
              color="secondary"
              variant="contained"
              className="marginButton"
              onClick={handleClose}
            />
          </div>
        );
        setModalTitle(modalTitle);
        setModalContent(modalContent);
        return;
      case WalletPopupState.SUCCESS:
        modalTitle = title || 'Success';
        modalContent = (
          <div className="delegateNodeModalSuccess">
            <Text
              style={{ marginBottom: '2%' }}
              label={title || 'Success'}
              variant="h6"
              color="primary"
            />
            <div className="successIcon">
              <SuccessIcon />
            </div>
            <p className="successText">{message || 'Action performed successfully'}</p>
            <Button
              type="button"
              label="Close"
              fullWidth
              color="secondary"
              variant="contained"
              className="marginButton"
              onClick={handleClose}
            />
          </div>
        );
        setModalTitle(modalTitle);
        setModalContent(modalContent);
        return;
      default:
        setModalTitle('');
        setModalContent(<></>);
    }
  };

  const asyncCallback = async (callback: AsyncCallbackType, args: any[]) => {
    if (typeof callback !== 'function') return;
    changeState(WalletPopupState.ACTION);
    try {
      const res = await callback(...args);
      changeState(WalletPopupState.LOADING);
      await res.wait();
      changeState(WalletPopupState.SUCCESS);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      changeState(WalletPopupState.ERROR, 'Error', `${error}`);
    }
  };

  return {
    state,
    showPopup,
    isMobile,
    modalTitle,
    modalContent,
    handleClose,
    asyncCallback,
  };
};

export const WalletPopupProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useProvideWalletPopup();
  const { isMobile, showPopup, modalTitle, modalContent, handleClose } = value;
  return (
    <WalletPopupContext.Provider value={value}>
      {showPopup && (
        <Modal
          id={isMobile ? 'mobile-signinModal' : 'signinModal'}
          title={modalTitle}
          show={showPopup}
          children={modalContent}
          parentElementID="root"
          onRequestClose={handleClose}
          closeIcon={CloseIcon}
        />
      )}
      {children}
    </WalletPopupContext.Provider>
  );
};

export const useWalletPopup = () => {
  return useContext(WalletPopupContext);
};
