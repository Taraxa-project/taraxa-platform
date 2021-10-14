import { Text, Loading } from "@taraxa_project/taraxa-ui";


interface IsUnstakingProps {
  amount: string;
}

const IsUnstaking = ({ amount }: IsUnstakingProps) => {
  return (
    <div>
      <Text label="UN-STAKING" variant="h6" color="primary" />
      <div className="iconContainer">
        <Loading />
      </div>
      <Text label={`Un-staking ${amount} TARA...`} variant="body2" color="primary" />
    </div>
  )
}

export default IsUnstaking;
