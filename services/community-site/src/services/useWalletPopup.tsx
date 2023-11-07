/* eslint-disable @typescript-eslint/no-unused-vars */
import { Text, Modal, Loading, Button } from '@taraxa_project/taraxa-ui';
import { networks } from '@taraxa_project/taraxa-sdk';
import { ethers } from 'ethers';
import React, { useState, useContext, createContext } from 'react';
import { useMediaQuery } from 'react-responsive';
import CloseIcon from '../assets/icons/close';
import ErrorIcon from '../assets/icons/error';
import SuccessIcon from '../assets/icons/success';
import WalletIcon from '../assets/icons/wallet';
import useMainnet from './useMainnet';

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
  asyncCallback: (callback: AsyncCallbackType, onSuccess?: () => void) => Promise<void>;
};

const initialState: Context = {
  state: WalletPopupState.DEFAULT,
  showPopup: false,
  isMobile: false,
  modalTitle: '',
  modalContent: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  asyncCallback: async (callback) => {
    try {
      await callback();
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
  const { chainId } = useMainnet();

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
            <div className="walletSVG">
              <WalletIcon />
            </div>
            <p className="successText" style={{ wordBreak: 'break-word' }}>
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
            <p className="successText" style={{ wordBreak: 'break-word' }}>
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
              color="info"
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
            <p className="successText">Action performed successfully</p>
            {chainId && message && (
              <>
                <p>You can view the transaction here:</p>
                <a
                  href={`${networks[chainId].blockExplorerUrl}/tx/${message}`}
                  rel="noreferrer"
                  target="_blank"
                  style={{ textDecoration: 'none' }}
                >
                  <Text mb={2} variant="body2" color="secondary" style={{ wordBreak: 'break-all' }}>
                    {message}
                  </Text>
                </a>
              </>
            )}
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

  const asyncCallback = async (callback: AsyncCallbackType, onSuccess?: () => void) => {
    if (typeof callback !== 'function') return;
    changeState(WalletPopupState.ACTION);
    try {
      const res = await callback();
      changeState(WalletPopupState.LOADING);
      const tx = await res.wait();
      changeState(WalletPopupState.SUCCESS, '', tx?.transactionHash);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      changeState(WalletPopupState.ERROR, 'Error', `${error.message}`);
    }
    if (typeof onSuccess === 'function') {
      onSuccess();
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
          id={isMobile ? 'mobile-walletModal' : 'walletModal'}
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
