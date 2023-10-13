import { ethers } from 'ethers';
import { DposAbi, DposAbi__factory as Dpos } from '../types/ethers-contracts';
import { DPOS_CONTRACT_ADDRESS, Network, networks } from './networks';

export class DposClient {
  private _dpos: DposAbi;

  private _provider: ethers.providers.Provider;

  private _signer: ethers.Signer | null = null;

  private _chainId: number;

  private _network: Network | undefined;

  constructor(networkIdOrName: number | string, privateKey?: string) {
    this._network = this.lookupNetwork(networkIdOrName);

    if (!this.network) {
      throw new Error('Invalid network ID or name');
    }
    this._chainId = this.getChainIdFromNetwork(this.network);

    this._provider = this.setupProvider(privateKey);
    this._dpos = Dpos.connect(DPOS_CONTRACT_ADDRESS, this.provider);
  }

  public get dpos(): DposAbi {
    return this._dpos;
  }

  public get signer(): ethers.Signer | null {
    return this._signer;
  }

  public get provider(): ethers.providers.Provider {
    return this._provider;
  }

  public get chain(): number {
    return this._chainId;
  }

  public get network(): Network | undefined {
    return this._network;
  }

  // Private methods
  private setupProvider(privateKey?: string): ethers.providers.Provider {
    let provider: ethers.providers.Provider;

    if (typeof window === 'undefined' || !privateKey) {
      if (!privateKey) {
        throw new Error('Private key is required for backend usage');
      }
      provider = new ethers.providers.JsonRpcProvider(this.network?.rpcUrl);
      this._signer = new ethers.Wallet(privateKey, provider);
    } else {
      provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      this._signer = (provider as ethers.providers.Web3Provider).getSigner();
    }

    return provider;
  }

  private lookupNetwork(networkIdOrName: number | string): Network | undefined {
    if (typeof networkIdOrName === 'number') {
      return networks[networkIdOrName];
    }
    return Object.values(networks).find(
      (network) =>
        network.chainName.toLowerCase() === networkIdOrName.toLowerCase()
    );
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

  async createNewTransactOpts(): Promise<ethers.Overrides> {
    if (!this.signer) {
      throw new Error('Signer is not initialized');
    }

    const address = await this.signer.getAddress();
    const nonce = await this.provider.getTransactionCount(address, 'pending');
    const gasPrice = await this.provider.getGasPrice();

    return {
      nonce,
      gasLimit: ethers.BigNumber.from(300000),
      gasPrice,
    };
  }

  private async getSetupForTransaction(): Promise<{
    contractWithSigner: ethers.Contract;
    overrides: ethers.Overrides;
  }> {
    if (!this.signer) {
      throw new Error('Signer is not set up.');
    }
    const overrides = await this.createNewTransactOpts();
    const contractWithSigner = this.dpos.connect(this.signer);
    return { contractWithSigner, overrides };
  }

  // Read methods
  async getTotalEligibleVotesCount(): Promise<number> {
    const totalVotes: ethers.BigNumber =
      await this.dpos.getTotalEligibleVotesCount();
    return totalVotes.toNumber();
  }

  async getValidator(
    validator: string
  ): Promise<ReturnType<DposAbi['getValidator']>> {
    return this.dpos.getValidator(validator);
  }

  async getValidators(
    batch: number
  ): Promise<ReturnType<DposAbi['getValidators']>> {
    return this.dpos.getValidators(batch);
  }

  async getValidatorsFor(
    owner: string,
    batch: number
  ): Promise<ReturnType<DposAbi['getValidatorsFor']>> {
    return this.dpos.getValidatorsFor(owner, batch);
  }

  async isValidatorEligible(
    validator: string
  ): Promise<ReturnType<DposAbi['isValidatorEligible']>> {
    return this.dpos.isValidatorEligible(validator);
  }

  async getDelegations(
    delegator: string,
    batch: number
  ): Promise<ReturnType<DposAbi['getDelegations']>> {
    return this.dpos.getDelegations(delegator, batch);
  }

  async getUndelegations(
    delegator: string,
    batch: number
  ): Promise<ReturnType<DposAbi['getUndelegations']>> {
    return this.dpos.getUndelegations(delegator, batch);
  }

  async getValidatorEligibleVotesCount(validator: string): Promise<number> {
    const votes: ethers.BigNumber =
      await this.dpos.getValidatorEligibleVotesCount(validator);
    return votes.toNumber();
  }

  // Write methods
  async delegate(
    amount: ethers.BigNumber,
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const { contractWithSigner, overrides } =
      await this.getSetupForTransaction();
    return contractWithSigner.delegate(validator, {
      value: amount,
      ...overrides,
    });
  }

  async undelegate(
    amount: ethers.BigNumber,
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const { contractWithSigner, overrides } =
      await this.getSetupForTransaction();
    return contractWithSigner.undelegate(validator, amount, overrides);
  }

  async confirmUndelegate(
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const { contractWithSigner, overrides } =
      await this.getSetupForTransaction();
    return contractWithSigner.confirmUndelegate(validator, overrides);
  }

  async cancelUndelegate(
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const { contractWithSigner, overrides } =
      await this.getSetupForTransaction();
    return contractWithSigner.cancelUndelegate(validator, overrides);
  }

  async reDelegate(
    amount: ethers.BigNumber,
    validatorFrom: string,
    validatorTo: string
  ): Promise<ethers.ContractTransaction> {
    const { contractWithSigner, overrides } =
      await this.getSetupForTransaction();
    return contractWithSigner.reDelegate(
      validatorFrom,
      validatorTo,
      amount,
      overrides
    );
  }

  async claimRewards(validator: string): Promise<ethers.ContractTransaction> {
    const { contractWithSigner, overrides } =
      await this.getSetupForTransaction();
    return contractWithSigner.claimRewards(validator, overrides);
  }

  async claimCommissionRewards(
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const { contractWithSigner, overrides } =
      await this.getSetupForTransaction();
    return contractWithSigner.claimCommissionRewards(validator, overrides);
  }

  async registerValidator(
    validator: string,
    proof: Uint8Array,
    vrf_key: Uint8Array,
    commission: number,
    description: string,
    endpoint: string
  ): Promise<ethers.ContractTransaction> {
    const { contractWithSigner, overrides } =
      await this.getSetupForTransaction();
    return contractWithSigner.registerValidator(
      validator,
      proof,
      vrf_key,
      commission,
      description,
      endpoint,
      overrides
    );
  }

  async setValidatorInfo(
    validator: string,
    description: string,
    endpoint: string
  ): Promise<ethers.ContractTransaction> {
    const { contractWithSigner, overrides } =
      await this.getSetupForTransaction();
    return contractWithSigner.setValidatorInfo(
      validator,
      description,
      endpoint,
      overrides
    );
  }

  async setCommission(
    validator: string,
    commission: number
  ): Promise<ethers.ContractTransaction> {
    const { contractWithSigner, overrides } =
      await this.getSetupForTransaction();
    return contractWithSigner.setCommission(validator, commission, overrides);
  }

  async claimAllRewards(): Promise<ethers.ContractTransaction> {
    const { contractWithSigner, overrides } =
      await this.getSetupForTransaction();
    return contractWithSigner.claimAllRewards(overrides);
  }
}
