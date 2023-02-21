import { useMemo } from 'react';
import { ethers } from 'ethers';
import useMainnet from './useMainnet';
import useChain from './useChain';

function useDpos() {
  const { provider: mainnetProvider } = useMainnet();
  const { provider: browserProvider, signer } = useChain();

  const abi = [
    'function cancelUndelegate(address validator)',
    'function claimCommissionRewards(address validator)',
    'function claimRewards(address validator)',
    'function confirmUndelegate(address validator)',
    'function delegate(address validator) payable',
    'function getDelegations(address delegator, uint32 batch) view returns (tuple(address account, tuple(uint256 stake, uint256 rewards) delegation)[] delegations, bool end)',
    'function getTotalEligibleVotesCount() view returns (uint64)',
    'function getUndelegations(address delegator, uint32 batch) view returns (tuple(uint256 stake, uint64 block, address validator)[] undelegations, bool end)',
    'function getValidator(address validator) view returns (tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, address owner, string description, string endpoint) validator_info)',
    'function getValidatorEligibleVotesCount(address validator) view returns (uint64)',
    'function getValidators(uint32 batch) view returns (tuple(address account, tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, address owner, string description, string endpoint) info)[] validators, bool end)',
    'function getValidatorsFor(address owner, uint256 batch) view returns (tuple(address account, tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, address owner, string description, string endpoint) info)[] validators, bool end)',
    'function isValidatorEligible(address validator) view returns (bool)',
    'function reDelegate(address validator_from, address validator_to, uint256 amount)',
    'function registerValidator(address validator, bytes proof, bytes vrf_key, uint16 commission, string description, string endpoint) payable',
    'function setCommission(address validator, uint16 commission)',
    'function setValidatorInfo(address validator, string description, string endpoint)',
    'function undelegate(address validator, uint256 amount)',
  ];

  const mainnetDpos = useMemo(() => {
    let instance: ethers.Contract | undefined;

    if (!mainnetProvider) {
      return instance;
    }

    try {
      const contract = new ethers.Contract(
        '0x00000000000000000000000000000000000000fe',
        abi,
        mainnetProvider,
      );
      instance = contract;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      instance = undefined;
    }
    return instance;
  }, [mainnetProvider]);

  const browserDpos = useMemo(() => {
    let instance: ethers.Contract | undefined;

    if (!browserProvider || !signer) {
      return instance;
    }
    const contract = new ethers.Contract(
      '0x00000000000000000000000000000000000000fe',
      abi,
      browserProvider,
    );
    return contract.connect(signer);
  }, [browserProvider, signer]);

  return {
    mainnetDpos,
    browserDpos,
  };
}

export default useDpos;
