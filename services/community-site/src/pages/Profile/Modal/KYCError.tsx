import React from "react";
import { Button, Text } from "@taraxa_project/taraxa-ui";

type KYCErrorProps = {
  onSuccess: () => void;
};

const KYCError = ({ onSuccess }: KYCErrorProps) => {
  return (
    <div>
      <div className="kycTopContainer">
        <Text
          style={{ marginBottom: "2%" }}
          label="Submit KYC"
          variant="h6"
          color="primary"
        />
        <Text
          style={{ marginBottom: "5%" }}
          label="Something went wrong, please try again."
          color="primary"
          variant="body1"
        />
        <Text
          label="ERROR: Image format should be JPG or PNG"
          variant="body2"
          color="textSecondary"
        />
      </div>

      <Button
        label="TRY AGAIN"
        color="secondary"
        variant="contained"
        className="marginButton"
        fullWidth
        onClick={() => onSuccess()}
      />
    </div>
  );
};

export default KYCError;
