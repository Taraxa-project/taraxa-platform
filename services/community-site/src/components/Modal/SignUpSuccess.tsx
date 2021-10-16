import { Button, Text } from '@taraxa_project/taraxa-ui';
import EmailIcon from '../../assets/icons/email';

const SignUpSuccess = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <div>
      <Text
        label="Create an account"
        variant="h6"
        color="primary"
        className="signUpSuccessfullTitle"
      />
      <EmailIcon />
      <Text label="Thank you" variant="body1" color="primary" style={{ marginTop: '10%' }} />
      <Text
        label="Please confirm your e-mail"
        variant="body1"
        color="primary"
        style={{ marginBottom: '10%' }}
      />

      <Text
        label="We have sent you a confirmation link, please confirm your e-mail to complete registration."
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

export default SignUpSuccess;
