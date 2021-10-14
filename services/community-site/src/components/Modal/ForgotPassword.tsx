
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Button, Text, InputField } from "@taraxa_project/taraxa-ui";
import { useAuth } from "../../services/useAuth";

const ForgotPassword = ({ onSuccess }: { onSuccess: () => void }) => {

  const auth = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [email, setEmail] = useState('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const submit = async (event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = await executeRecaptcha!("forgot_password");
    const result = await auth.sendPasswordResetEmail!(email, token);

    if (result.success) {
      setHasError(false);
      setError("");
      onSuccess();
    } else {
      setHasError(true);
      setError(result.response[0].messages[0].message);
    }
  };

  return (
    <div>
      <Text label="Forgot Password" variant="h6" color="primary" />
      <Text label="Please, enter your registration e-mail." variant="body2" color="textSecondary" />
      <form onSubmit={submit}>
        <InputField error={hasError} helperText={error} label="E-mail" placeholder="Your email..." value={email} variant="outlined" type="text" fullWidth margin="normal" onChange={event => {
          setEmail(event.target.value);
        }} />

        <Button type="submit" label="Reset Password" color="secondary" variant="contained" className="marginButton" onClick={submit} fullWidth />
      </form>
    </div>
  )
}

export default ForgotPassword;
