import React from 'react';
import { Button } from '@taraxa_project/taraxa-ui';
import './warning.scss';
import WarningSign from '../../../assets/icons/warningSign';

interface RedeemWarningProps {
  amount: string;
  onAccept: () => void;
  onDenial: () => void;
}

export const TX_FEE_WARN = `Once you click on the Redeem button, you are locked
into this transaction and it cannot be cancelled. 

If you wish to accumulate more TARA to claim
later on, in order to minimize transaction fees, please do NOT click on Redeem right now.`;

const RedeemWarning = (props: RedeemWarningProps) => {
  const { amount, onAccept, onDenial } = props;
  return (
    <div className="redeem-warning">
      <WarningSign />
      <br />
      <span className="wide-title">{`You are redeeming ${amount} TARA`}</span>
      <br />
      <div className="central-container">
        <span>
          <span className="linebreak">{TX_FEE_WARN}</span>
        </span>
      </div>
      <br />
      <Button
        disableElevation
        size="medium"
        variant="contained"
        className="redeemable"
        color="secondary"
        onClick={() => onAccept()}
        label={`Redeem ${amount} TARA`}
      />
      <br />
      <Button
        size="large"
        variant="outlined"
        className="cancel"
        color="primary"
        onClick={() => onDenial()}
        label="Cancel"
      />
    </div>
  );
};
export default RedeemWarning;
