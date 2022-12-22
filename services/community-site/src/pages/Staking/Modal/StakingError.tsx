import React from "react";
import { Button, Text } from "@taraxa_project/taraxa-ui";
import ErrorIcon from "../../../assets/icons/error";

interface StakingErrorProps {
  amount: string;
  onSuccess: () => void;
}

const StakingError = ({ amount, onSuccess }: StakingErrorProps) => {
  return (
    <div>
      <Text label="ERROR" variant="h6" color="primary" />
      <div className="iconContainer">
        <ErrorIcon />
      </div>
      <Text
        label={`Minimum amount to stake is ${amount} TARA.`}
        variant="body2"
        color="primary"
      />
      <Button
        className="staking-error-button"
        label="OK"
        color="secondary"
        variant="contained"
        fullWidth
        onClick={onSuccess}
      />
    </div>
  );
};

export default StakingError;
