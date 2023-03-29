import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Text, InputField, AmountCard, AutocompleteField } from '@taraxa_project/taraxa-ui';
import useCMetamask from '../../../services/useCMetamask';

import useDelegation from '../../../services/useDelegation';

import { stripEth, weiToEth } from '../../../utils/eth';
import { Validator } from '../../../interfaces/Validator';
import { useWalletPopup } from '../../../services/useWalletPopup';

type ReDelegateProps = {
  reDelegatableBalance: ethers.BigNumber;
  validatorFrom: Validator;
  delegatableValidators: Validator[];
  onSuccess: () => void;
  onFinish: () => void;
};

const ReDelegate = ({
  validatorFrom,
  delegatableValidators,
  reDelegatableBalance,
  onSuccess,
  onFinish,
}: ReDelegateProps) => {
  const { account } = useCMetamask();
  const { reDelegate } = useDelegation();
  const { asyncCallback } = useWalletPopup();

  const [reDelegationTotal, setReDelegationTotal] = useState(reDelegatableBalance);
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [autocompleteError, setAutocompleteError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [validatorTo, setValidatorTo] = useState<Validator>();

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validatorTo) {
      setAutocompleteError('Missing Validator to');
    }

    if (
      reDelegationTotal.lt(ethers.BigNumber.from('1000').mul(ethers.BigNumber.from('10').pow(18)))
    ) {
      setError('must be a number greater than 1,000');
      return;
    }

    // if (delegationTotal.gt(availableStakingBalance)) {
    //   setError('cannot exceed TARA available for delegation');
    //   return;
    // }
    if (reDelegationTotal.gt(validatorFrom.availableForDelegation)) {
      setError("cannot exceed validator's ability to receive delegation");
      return;
    }
    if (!account) {
      setError('you must be connected to Metamask!');
      return;
    }

    setError('');

    if (!error && validatorTo?.address !== undefined && validatorTo?.address !== null) {
      asyncCallback(async () => {
        onFinish();
        return await reDelegate(validatorFrom.address, validatorTo.address, reDelegationTotal);
      }, onSuccess);
    }
  };

  return (
    <div className="delegateNodeModal">
      <Text
        style={{ marginBottom: '32px', fontSize: '18px' }}
        align="center"
        label="Re-Delegate from..."
        variant="h6"
        color="primary"
      />
      <div className="nodeDescriptor">
        <p className="nodeAddressWrapper">
          <span className="nodeAddress">{validatorFrom.address}</span>
        </p>
      </div>
      <Text
        style={{ marginBottom: '32px', fontSize: '18px' }}
        align="center"
        label="Re-Delegate to..."
        variant="h6"
        color="primary"
      />
      <AutocompleteField
        options={delegatableValidators.map((d) => ({ label: d.address, id: d.address }))}
        renderInput={(params) => (
          <InputField
            error={!!autocompleteError}
            helperText={autocompleteError}
            {...params}
            label="Validator"
          />
        )}
        onChange={(event, value) => {
          const selectedValidator = delegatableValidators.find((d) => d.address === value?.label);
          if (!selectedValidator) {
            setAutocompleteError('Validator address must be part of the list');
          } else {
            setAutocompleteError('');
            setValidatorTo(selectedValidator);
          }
        }}
      />
      {validatorTo && reDelegationTotal && (
        <div className="taraContainerWrapper" style={{ marginTop: '1rem' }}>
          <div className="taraContainer taraContainerBalance">
            <p className="taraContainerAmountDescription">Available TARA for re-delegation</p>
            <AmountCard amount={stripEth(reDelegationTotal)} unit="TARA" />
          </div>
          <div className="taraContainer">
            <p className="taraContainerAmountDescription">
              Validator's availability to receive delegation
            </p>
            <AmountCard amount={stripEth(validatorTo.availableForDelegation)} unit="TARA" />
          </div>
        </div>
      )}
      <div className="taraInputWrapper">
        <p className="maxDelegatableDescription">Maximum delegate-able</p>
        <p className="maxDelegatableTotal">{stripEth(reDelegationTotal)}</p>
        <p className="maxDelegatableUnit">TARA</p>
        <InputField
          error={!!error}
          helperText={error}
          label="Enter amount..."
          value={parseInt(weiToEth(reDelegationTotal), 10)}
          variant="outlined"
          type="text"
          fullWidth
          margin="normal"
          onChange={(event) => {
            const currentVal = ethers.BigNumber.from(event.target.value || 0);
            if (
              currentVal.lt(ethers.BigNumber.from('1000')) ||
              currentVal.mul(ethers.BigNumber.from('10').pow(18)).gt(reDelegatableBalance)
            ) {
              setError(
                `must be a number greater than 1,000 and lesser than or equal ${stripEth(
                  reDelegatableBalance,
                )}`,
              );
            } else {
              setError('');
            }
            setReDelegationTotal(
              ethers.BigNumber.from(event.target.value || 0).mul(
                ethers.BigNumber.from('10').pow(18),
              ),
            );
          }}
        />
        <div className="delegatePercentWrapper">
          <Button
            size="small"
            className="delegatePercent"
            label="25%"
            variant="contained"
            onClick={() => {
              setReDelegationTotal(reDelegatableBalance.mul(25).div(100));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="50%"
            variant="contained"
            onClick={() => {
              setReDelegationTotal(reDelegatableBalance.mul(50).div(100));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="75%"
            variant="contained"
            onClick={() => {
              setReDelegationTotal(reDelegatableBalance.mul(75).div(100));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="100%"
            variant="contained"
            onClick={() => {
              setReDelegationTotal(reDelegatableBalance.mul(100).div(100));
            }}
          />
        </div>
        <Button
          type="submit"
          label="Re-Delegate"
          color="secondary"
          variant="contained"
          className="marginButton"
          fullWidth
          onClick={submit}
        />
      </div>
    </div>
  );
};

export default ReDelegate;
