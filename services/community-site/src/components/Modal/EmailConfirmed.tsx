import React from "react";
import { Button, Text } from "@taraxa_project/taraxa-ui";
import EmailIcon from "../../assets/icons/email";

const EmailConfirmed = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <div>
      <Text
        label="Create an account"
        variant="h6"
        color="primary"
        className="signUpSuccessfullTitle"
      />
      <EmailIcon />
      <Text
        label="Thanks for validating your email!"
        variant="body1"
        color="primary"
        style={{ marginBottom: "10%" }}
      />

      <Text
        label="You can now log in with your credentials."
        variant="body2"
        color="textSecondary"
        style={{ marginBottom: "5%" }}
      />
      <Button
        label="OK"
        color="secondary"
        variant="contained"
        onClick={() => onSuccess()}
        fullWidth
        className="marginButton"
      />
    </div>
  );
};

export default EmailConfirmed;
