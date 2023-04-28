import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Text, InputField } from '@taraxa_project/taraxa-ui';
import useCMetamask from '../../../services/useCMetamask';

import useDelegation from '../../../services/useDelegation';

import { weiToEth } from '../../../utils/eth';
import { useWalletPopup } from '../../../services/useWalletPopup';
import { useRedelegation } from '../../../services/useRedelegation';
import { compareDelegationTo } from '../../../utils/compareDelegationTo';
import Nickname from '../../../components/Nickname/Nickname';

type ReDelegateProps = {
  reDelegatableBalance: ethers.BigNumber;
  onSuccess: () => void;
  onFinish: () => void;
};

const ReDelegate = ({ reDelegatableBalance, onSuccess, onFinish }: ReDelegateProps) => {
  const { account } = useCMetamask();
  const { reDelegate } = useDelegation();
  const { asyncCallback } = useWalletPopup();
  const { validatorFrom, validatorTo } = useRedelegation();

  let maximumReDelegatable = '0';
  maximumReDelegatable = weiToEth(reDelegatableBalance);
  const [reDelegationTotal, setReDelegationTotal] = useState<string>(
    maximumReDelegatable.toString(),
  );
  const [error, setError] = useState('');

  const delegatePercent = (percentage: number): string => {
    return parseFloat((+maximumReDelegatable * (percentage / 100)).toFixed(2)).toString();
  };

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const reDelegationNumber = parseFloat(reDelegationTotal);

    if (!validatorFrom) {
      setError('Missing Validator from');
      return;
    }

    if (!validatorTo) {
      setError('Missing Validator to');
      return;
    }

    if (Number.isNaN(reDelegationNumber) || reDelegationNumber < 1000) {
      setError('must be a number greater than 1,000');
      return;
    }

    if (
      parseFloat(reDelegationTotal) > parseFloat(weiToEth(validatorFrom.availableForDelegation))
    ) {
      setError("cannot exceed validator's ability to receive delegation");
      return;
    }
    if (!account) {
      setError('you must be connected to Metamask!');
      return;
    }

    const reDelegateValue = ethers.utils.parseUnits(
      reDelegationNumber.toString().replace(',', '.'),
      18,
    );

    setError('');

    if (!error && validatorTo?.address !== undefined && validatorTo?.address !== null) {
      asyncCallback(async () => {
        onFinish();
        return await reDelegate(validatorFrom.address, validatorTo.address, reDelegateValue);
      }, onSuccess);
    }
  };

  return (
    <div className="delegateNodeModal">
      <Text
        style={{ marginBottom: '12px', fontSize: '18px' }}
        align="center"
        label="Shift Delegation (Re-delegate)"
        variant="h6"
        color="primary"
      />
      {validatorFrom && (
        <div className="nodeDescriptor">
          <Text
            style={{ marginBottom: '12px', fontSize: '18px' }}
            align="center"
            label="FROM"
            variant="body2"
            color="primary"
          />
          <Nickname
            size="medium"
            showIcon
            address={validatorFrom.address}
            description={validatorFrom.description}
          />
        </div>
      )}
      <div className="redelegation-arrow">⬇⬇⬇</div>
      {validatorTo && (
        <div className="nodeDescriptor">
          <Text
            style={{ marginBottom: '12px', fontSize: '18px' }}
            align="center"
            label="TO"
            variant="body2"
            color="primary"
          />
          <Nickname
            size="medium"
            showIcon
            address={validatorTo.address}
            description={validatorTo.description}
          />
        </div>
      )}
      {/* {validatorTo && reDelegationTotal && (
        <div className="taraContainerWrapper" style={{ marginTop: '1rem' }}>
          <div className="taraContainer taraContainerBalance">
            <p className="taraContainerAmountDescription">Available TARA for re-delegation</p>
            <AmountCard amount={reDelegationTotal} unit="TARA" />
          </div>
          <div className="taraContainer">
            <p className="taraContainerAmountDescription">
              Validator's availability to receive delegation
            </p>
            <AmountCard amount={stripEth(validatorTo.availableForDelegation)} unit="TARA" />
          </div>
        </div>
      )} */}
      <div className="taraInputWrapper">
        <p className="maxDelegatableDescription">Maximum delegate-able</p>
        <p className="maxDelegatableTotal">{reDelegationTotal}</p>
        <p className="maxDelegatableUnit">TARA</p>
        <InputField
          error={!!error}
          helperText={error}
          label="Enter amount..."
          value={reDelegationTotal}
          variant="outlined"
          type="text"
          fullWidth
          margin="normal"
          onChange={(event) => {
            setReDelegationTotal(event.target.value);
          }}
          onKeyUp={(event) => {
            const inputValue = (event.target as HTMLInputElement).value;
            if (
              compareDelegationTo(inputValue, '1000') ||
              parseFloat(inputValue) > parseFloat(maximumReDelegatable)
            ) {
              setError(
                `must be a number greater than 1,000 and lesser than or equal ${maximumReDelegatable}`,
              );
            } else {
              setError('');
            }
          }}
        />
        <div className="delegatePercentWrapper">
          <Button
            size="small"
            className="delegatePercent"
            label="25%"
            variant="contained"
            onClick={() => {
              setReDelegationTotal(delegatePercent(25));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="50%"
            variant="contained"
            onClick={() => {
              setReDelegationTotal(delegatePercent(50));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="75%"
            variant="contained"
            onClick={() => {
              setReDelegationTotal(delegatePercent(75));
            }}
          />
          <Button
            size="small"
            className="delegatePercent"
            label="100%"
            variant="contained"
            onClick={() => {
              setReDelegationTotal(maximumReDelegatable);
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
