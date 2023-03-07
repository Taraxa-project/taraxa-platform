import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Text, AmountCard, Loading } from '@taraxa_project/taraxa-ui';
import SuccessIcon from '../../../assets/icons/success';

import useDelegation from '../../../services/useDelegation';

import { stripEth } from '../../../utils/eth';
import { Validator } from '../../../interfaces/Validator';

type ClaimProps = {
  amount: ethers.BigNumber;
  validator: Validator;
  onSuccess: () => void;
  onFinish: () => void;
  commissionMode?: boolean;
};

const Claim = ({ amount, validator, onSuccess, onFinish, commissionMode = false }: ClaimProps) => {
  const { claimRewards, claimCommissionRewards } = useDelegation();
  const [isLoading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const claim = async () => {
    setLoading(true);
    try {
      let res;
      if (commissionMode) {
        res = await claimCommissionRewards(validator.address);
      } else {
        res = await claimRewards(validator.address);
      }
      setStep(2);
      await res.wait();
      setLoading(false);
      onSuccess();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="delegateNodeModal">
      {step === 1 ? (
        <>
          <Text
            style={{ marginBottom: '32px', fontSize: '18px' }}
            align="center"
            label={
              commissionMode ? 'Claiming commission rewards from...' : 'Claiming rewards from...'
            }
            variant="h6"
            color="primary"
          />
          <div className="nodeDescriptor">
            <p className="nodeAddressWrapper">
              <span className="nodeAddress">{validator.address}</span>
            </p>
          </div>
          <div className="claimContainer">
            <p className="taraContainerAmountDescription">Amount to be claimed:</p>
            <AmountCard amount={stripEth(amount)} unit="TARA" />
            <br />
            <Button
              type="submit"
              label="Claim"
              fullWidth
              color="secondary"
              variant="contained"
              className="marginButton"
              onClick={() => {
                claim();
              }}
            />
          </div>
        </>
      ) : isLoading ? (
        <div className="delegateNodeModalSuccess">
          <Text label="Waiting for confirmation" variant="h6" color="warning" />
          <div className="loadingIcon">
            <Loading />
          </div>
          <p className="successText">{`Awaiting claim confirmation for ${stripEth(
            amount,
          )} TARA...`}</p>
        </div>
      ) : (
        <div className="delegateNodeModalSuccess">
          <Text style={{ marginBottom: '2%' }} label="Success" variant="h6" color="primary" />
          <div className="successIcon">
            <SuccessIcon />
          </div>
          <p className="successText">{`You've successfully claimed ${stripEth(amount)} TARA!`}</p>
          <Button
            type="submit"
            label="Close"
            fullWidth
            color="secondary"
            variant="contained"
            className="marginButton"
            onClick={() => {
              onFinish();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Claim;
