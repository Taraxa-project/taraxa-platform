/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useContext, createContext, useEffect } from 'react';
import { Validator } from '../interfaces/Validator';

type Context = {
  isRedelegating: boolean;
  validatorFrom: Validator | null;
  validatorTo: Validator | null;
  showNotice: boolean;
  showPopup: boolean;
  setValidatorFrom?: (validator: Validator | null) => void;
  setValidatorTo?: (validator: Validator | null) => void;
  setIsRedelegating?: (isRedelegation: boolean) => void;
};

const initialState: Context = {
  isRedelegating: false,
  validatorFrom: null,
  validatorTo: null,
  showNotice: false,
  showPopup: false,
};

const RedelegationContext = createContext<Context>(initialState);

const useProvideRedelegation = () => {
  const [isRedelegating, setIsRedelegating] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [validatorFrom, setValidatorFrom] = useState<Validator | null>(null);
  const [validatorTo, setValidatorTo] = useState<Validator | null>(null);

  useEffect(() => {
    if (isRedelegating) {
      if (validatorTo) {
        setShowNotice(true);
        if (validatorFrom) {
          setShowPopup(true);
        } else {
          setShowPopup(false);
        }
      } else {
        setShowNotice(false);
      }
    } else {
      setShowNotice(false);
      setShowPopup(false);
    }
  }, [isRedelegating, validatorFrom, validatorTo]);

  return {
    isRedelegating,
    showNotice,
    showPopup,
    validatorFrom,
    validatorTo,
    setValidatorFrom,
    setValidatorTo,
    setIsRedelegating,
  };
};

export const RedelegationProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useProvideRedelegation();
  return <RedelegationContext.Provider value={value}>{children}</RedelegationContext.Provider>;
};

export const useRedelegation = () => {
  return useContext(RedelegationContext);
};
