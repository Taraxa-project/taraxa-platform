import { ethers } from 'ethers';
import { Network, networks } from '../utils/networks';

export class TaraxaDposClient {
  public mainnetProvider: ethers.providers.JsonRpcProvider;

  public browserProvider: ethers.providers.Web3Provider | null = null;

  public signer: ethers.Signer | null = null;

  public chainId: number;

  public network: Network;

  public mainnetDpos: ethers.Contract | null = null;

  public browserDpos: ethers.Contract | null = null;

  constructor(networkIdOrName: number | string, privateKey?: string) {
    this.network = this.lookupNetwork(networkIdOrName);

    if (!this.network) {
      throw new Error('Invalid network ID or name');
    }
    this.chainId = this.getChainIdFromNetwork(this.network);

    this.mainnetProvider = new ethers.providers.JsonRpcProvider(
      this.network.rpcUrl
    );

    if (typeof window === 'undefined') {
      this.setupBackendProvider(privateKey);
    } else {
      this.setupFrontendProvider();
    }

    this.initializeContracts();
  }

  private setupBackendProvider(privateKey?: string) {
    if (!privateKey) {
      throw new Error('Private key is required for backend usage');
    }

    try {
      const wallet = new ethers.Wallet(privateKey, this.mainnetProvider);
      this.signer = wallet;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create signer', error);
      throw new Error('Failed to create signer with provided private key');
    }
  }

  private setupFrontendProvider() {
    if (window.ethereum) {
      this.browserProvider = new ethers.providers.Web3Provider(
        window.ethereum,
        'any'
      );
      this.signer = this.browserProvider.getSigner();
    }
  }

  private initializeContracts() {
    const abi = [
      'function cancelUndelegate(address validator)',
      'function claimCommissionRewards(address validator)',
      'function claimRewards(address validator)',
      'function confirmUndelegate(address validator)',
      'function delegate(address validator) payable',
      'function getDelegations(address delegator, uint32 batch) view returns (tuple(address account, tuple(uint256 stake, uint256 rewards) delegation)[] delegations, bool end)',
      'function getTotalEligibleVotesCount() view returns (uint64)',
      'function getUndelegations(address delegator, uint32 batch) view returns (tuple(uint256 stake, uint64 block, address validator, bool validator_exists)[] undelegations, bool end)',
      'function getValidator(address validator) view returns (tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, address owner, string description, string endpoint) validator_info)',
      'function getValidatorEligibleVotesCount(address validator) view returns (uint64)',
      'function getValidators(uint32 batch) view returns (tuple(address account, tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, address owner, string description, string endpoint) info)[] validators, bool end)',
      'function getValidatorsFor(address owner, uint32 batch) view returns (tuple(address account, tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, address owner, string description, string endpoint) info)[] validators, bool end)',
      'function isValidatorEligible(address validator) view returns (bool)',
      'function reDelegate(address validator_from, address validator_to, uint256 amount)',
      'function registerValidator(address validator, bytes proof, bytes vrf_key, uint16 commission, string description, string endpoint) payable',
      'function setCommission(address validator, uint16 commission)',
      'function setValidatorInfo(address validator, string description, string endpoint)',
      'function undelegate(address validator, uint256 amount)',
    ];

    if (this.mainnetProvider) {
      this.mainnetDpos = new ethers.Contract(
        '0x00000000000000000000000000000000000000fe',
        abi,
        this.mainnetProvider
      );
    }

    if (this.browserProvider && this.signer) {
      const contract = new ethers.Contract(
        '0x00000000000000000000000000000000000000fe',
        abi,
        this.browserProvider
      );
      this.browserDpos = contract.connect(this.signer);
    }
  }

  private lookupNetwork(networkIdOrName: number | string): Network {
    if (typeof networkIdOrName === 'number') {
      return networks[networkIdOrName];
    }
    const network = Object.values(networks).find(
      (network) =>
        network.chainName.toLowerCase() === networkIdOrName.toLowerCase()
    )!;
    return network;
  }

  private getChainIdFromNetwork(network: Network): number {
    const chainId = Object.keys(networks).find(
      (key) => networks[parseInt(key, 10)] === network
    );
    if (!chainId) {
      throw new Error('Chain ID not found for the provided network');
    }
    return parseInt(chainId, 10);
  }
}
