import { Text, Loading } from '@taraxa_project/taraxa-ui';

interface ApproveProps {
  amount: string;
}

const Approve = ({ amount }: ApproveProps) => {
  return (
    <div>
      <Text label="APPROVING" variant="h6" color="primary" />
      <div className="iconContainer">
        <Loading />
      </div>
      <Text
        label={`Please authorize the Staking contract to stake ${amount} TARA from your account.`}
        variant="body2"
        color="primary"
      />
    </div>
  );
};

export default Approve;
