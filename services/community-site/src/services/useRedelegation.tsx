import React, { useState, useEffect, useContext, createContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Text, Skeleton } from '@taraxa_project/taraxa-ui';
import { Validator } from '../interfaces/Validator';
import Nickname from '../components/Nickname/Nickname';

type Context = {
  validatorFrom: Validator | null;
  validatorTo: Validator | null;
  showPopup: boolean;
  setValidatorFrom: (validator: Validator) => void;
  setValidatorTo: (validator: Validator) => void;
  clearRedelegation: () => void;
};

const defaultSetValidator = (validator: Validator): void => {
  // eslint-disable-next-line no-console
  console.log('default validator: ', validator);
};

const initialState: Context = {
  validatorFrom: null,
  validatorTo: null,
  showPopup: false,
  setValidatorFrom: defaultSetValidator,
  setValidatorTo: defaultSetValidator,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearRedelegation: () => {},
};

const RedelegationContext = createContext<Context>(initialState);

const useProvideRedelegation = () => {
  const location = useLocation();
  const [validatorFrom, setValidatorFrom] = useState<Validator | null>(null);
  const [validatorTo, setValidatorTo] = useState<Validator | null>(null);

  const clearRedelegation = () => {
    setValidatorFrom(null);
    setValidatorTo(null);
  };

  useEffect(() => {
    clearRedelegation();
  }, [location]);

  const notice = validatorFrom && !validatorTo && (
    <div className="redelegation-notice">
      <div className="notice-container">
        <div>
          <Text label="Validator From" variant="body1" style={{ marginBottom: '1rem' }} />
          <Nickname
            showIcon
            address={validatorFrom.address}
            description={validatorFrom.description}
          />
        </div>
        <div>
          <Text label="Validator To" variant="body1" style={{ marginBottom: '1rem' }} />
          <Skeleton variant="text" sx={{ fontSize: '1rem', width: '300px' }} />
          <Skeleton variant="text" sx={{ fontSize: '1rem', width: '300px' }} />
        </div>
        <Button
          size="small"
          color="error"
          label="Cancel"
          variant="contained"
          onClick={clearRedelegation}
          disableElevation
        />
      </div>
    </div>
  );

  const showPopup = !!validatorFrom && !!validatorTo;

  return {
    notice,
    showPopup,
    validatorFrom,
    validatorTo,
    setValidatorFrom,
    setValidatorTo,
    clearRedelegation,
  };
};

export const RedelegationProvider = ({ children }: { children: React.ReactNode }) => {
  const { notice, ...value } = useProvideRedelegation();
  return (
    <RedelegationContext.Provider value={value}>
      {notice}
      {children}
    </RedelegationContext.Provider>
  );
};

export const useRedelegation = () => {
  return useContext(RedelegationContext);
};
