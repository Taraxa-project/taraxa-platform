import { Button, Text } from '@taraxa_project/taraxa-ui';
import EmailIcon from '../../assets/icons/email';

const ForgotPasswordSuccess = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <div>
      <Text
        label="Forgot password"
        variant="h6"
        color="primary"
        className="signUpSuccessfullTitle"
      />
      <EmailIcon />
      <Text
        label="We have sent your new password to your registration e-mail."
        variant="body1"
        color="primary"
        style={{ marginBottom: '10%' }}
      />

      <Text
        label="Please log in with your new password."
        variant="body2"
        color="textSecondary"
        style={{ marginBottom: '5%' }}
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

export default ForgotPasswordSuccess;
