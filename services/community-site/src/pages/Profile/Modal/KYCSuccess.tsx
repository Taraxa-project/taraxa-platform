import React from 'react';
import { Button, Text } from '@taraxa_project/taraxa-ui';

type KYCSuccessProps = {
  onSuccess: () => void;
};

const KYCSuccess = ({ onSuccess }: KYCSuccessProps) => {
  return (
    <div>
      <div className="kycTopContainer">
        <Text style={{ marginBottom: '2%' }} label="Submit KYC" variant="h6" color="primary" />
        <Text
          style={{ marginBottom: '5%' }}
          label="Thank you! We will contact you via e-mail."
          color="primary"
          variant="body1"
        />
        <Text
          label="You have successfully submitted KYC! Let us check it and get back to you."
          variant="body2"
          color="textSecondary"
        />
      </div>

      <Button
        label="OK"
        color="secondary"
        variant="contained"
        className="marginButton"
        fullWidth
        onClick={() => onSuccess()}
      />
    </div>
  );
};

export default KYCSuccess;
