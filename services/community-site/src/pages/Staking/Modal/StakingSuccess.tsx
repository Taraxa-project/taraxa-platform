import { Button, Text } from '@taraxa_project/taraxa-ui'
import { useMetaMask } from 'metamask-react'

import SuccessIcon from '../../../assets/icons/success'
import LockIcon from './../../../assets/icons/lock'

interface StakingSuccessProps {
  lockingPeriod: string
  transactionHash: null | string
  onSuccess: () => void
}

const StakingSuccess = ({
  lockingPeriod,
  transactionHash,
  onSuccess,
}: StakingSuccessProps) => {
  const { chainId: hexChainId } = useMetaMask()

  let chainId = 1
  if (hexChainId !== null) {
    chainId = parseInt(hexChainId, 16)
  }

  let etherscanBaseUrl = 'https://etherscan.io/tx/'
  if (chainId === 3) {
    etherscanBaseUrl = 'https://ropsten.etherscan.io/tx/'
  }
  if (chainId === 4) {
    etherscanBaseUrl = 'https://rinkeby.etherscan.io/tx/'
  }
  if (chainId === 42) {
    etherscanBaseUrl = 'https://kovan.etherscan.io/tx/'
  }
  if (chainId === 5) {
    etherscanBaseUrl = 'https://goerli.etherscan.io/tx/'
  }
  return (
    <div>
      <Text label="SUCCESS" variant="h6" color="primary" />
      <div className="iconContainer">
        <SuccessIcon />
      </div>
      <Text
        label={`Your TARA has been successfully transferred to the staking contract.`}
        variant="body2"
        color="primary"
      />

      <Button
        variant="text"
        color="secondary"
        label="View on Etherscan"
        onClick={() =>
          window.open(
            `${etherscanBaseUrl}${transactionHash}`,
            '_blank',
            'noreferrer noopener'
          )
        }
      />

      <div className="staking-success-container">
        <Text label="Please keep in mind:" className="title" />
        <div className="lock-container">
          <LockIcon />
          <Text
            className="lock-container-text"
            label={`Lock-in period: ${lockingPeriod}`}
            color="primary"
          />
        </div>
        <Text color="textSecondary">
          After {lockingPeriod} you will be able to withdraw your TARA (If you
          don’t withdraw, your funds remain staked and unlocked).
          <a
            href="https://taraxa.io/faq/staking"
            target="_blank"
            rel="noreferrer"
            className="default-link"
          >
            View full staking rules
          </a>
        </Text>
      </div>
      <Button
        className="staking-success-button"
        label="OK"
        color="secondary"
        variant="contained"
        fullWidth
        onClick={onSuccess}
      />
    </div>
  )
}

export default StakingSuccess
