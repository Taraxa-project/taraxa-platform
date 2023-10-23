/* eslint-disable no-console */
import { ethers } from 'ethers';
import { DposAbi, DposAbi__factory as Dpos } from '../types/ethers-contracts';
import {
  DPOS_CONTRACT_ADDRESS,
  Network,
  NetworkName,
  ProviderType,
  getNetwork,
  getNetworkById,
} from './networks';
import {
  ContractDelegation,
  ContractUndelegation,
  ContractValidator,
  Delegation,
  Undelegation,
  Validator,
  ValidatorStatus,
  ValidatorType,
} from './interfaces';
import {
  JsonRpcProviderFactory,
  ProviderFactory,
  Web3ProviderFactory,
} from './ProviderFactory';

export class DposClient {
  private _dpos: DposAbi;

  private _provider: ethers.providers.Provider;

  private _signer: ethers.Signer | null = null;

  private _chainId: number | undefined;

  private _network: Network | null;

  constructor(
    networkIdOrName: number | NetworkName,
    providerType: ProviderType,
    privateKey?: string
  ) {
    let factory: ProviderFactory;
    this._network = this.lookupNetwork(networkIdOrName);

    if (!this._network) {
      throw new Error('Invalid network ID or name');
    }

    this._chainId = this._network?.chainId;

    if (!this._chainId) {
      throw new Error('Chain ID not found for the provided network name');
    }

    if (providerType === ProviderType.RPC || typeof window === 'undefined') {
      factory = new JsonRpcProviderFactory(this._network.rpcUrl, privateKey);
    } else if (providerType === ProviderType.WEB3) {
      factory = new Web3ProviderFactory();
    } else {
      throw new Error('Invalid provider type');
    }

    this._provider = factory.createProvider();
    this._signer = factory.createSigner(this._provider);

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

  public get chain(): number | undefined {
    return this._chainId;
  }

  public get network(): Network | null {
    return this._network;
  }

  // Private methods
  private lookupNetwork(networkIdOrName: NetworkName | number): Network | null {
    if (typeof networkIdOrName === 'number') {
      return getNetworkById(networkIdOrName);
    }
    return getNetwork(networkIdOrName);
  }

  private async getContract(): Promise<ethers.Contract> {
    if (!this.signer) {
      throw new Error('Signer is not set up.');
    }
    const contractWithSigner = this.dpos.connect(this.signer);
    return contractWithSigner;
  }

  private mapContractToValidator(
    contractValidator: ContractValidator
  ): Validator {
    const maxDelegation = ethers.BigNumber.from(80000000).mul(
      ethers.BigNumber.from(10).pow(18)
    );
    return {
      address: contractValidator.account,
      owner: contractValidator.info.owner,
      commission: +(
        parseFloat(`${contractValidator.info.commission}` || '0') / 100
      ).toPrecision(2),
      commissionReward: contractValidator.info.commission_reward,
      lastCommissionChange:
        contractValidator.info.last_commission_change.toNumber(),
      delegation: contractValidator.info.total_stake,
      availableForDelegation: maxDelegation.sub(
        contractValidator.info.total_stake
      ),
      isFullyDelegated: contractValidator.info.total_stake.eq(maxDelegation),
      isActive: false,
      status: ValidatorStatus.NOT_ELIGIBLE,
      description: contractValidator.info.description,
      endpoint: contractValidator.info.endpoint,
      rank: 0,
      pbftsProduced: 0,
      yield: 0,
      type: ValidatorType.MAINNET,
    };
  }

  // Read methods
  async getTotalEligibleVotesCount(): Promise<number> {
    const totalVotes: ethers.BigNumber =
      await this.dpos.getTotalEligibleVotesCount();
    return totalVotes.toNumber();
  }

  async getValidator(address: string): Promise<Validator> {
    try {
      const validatorInfo = await this.dpos.getValidator(address);
      const contractValidator: ContractValidator = {
        account: address,
        info: validatorInfo,
      };
      return this.mapContractToValidator(contractValidator);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getValidators(): Promise<Validator[]> {
    let validators: ContractValidator[] = [];
    let page = 0;
    let hasNextPage = true;

    while (hasNextPage) {
      try {
        const allValidators = await this.dpos.getValidators(page);
        validators = [...validators, ...allValidators.validators];
        hasNextPage = !allValidators.end;
        page++;
      } catch (e) {
        console.error(e);
        hasNextPage = false;
        return [];
      }
    }

    return validators.map((validator) =>
      this.mapContractToValidator(validator)
    );
  }

  async getValidatorsWith(addresses: string[]): Promise<Validator[]> {
    if (addresses.length === 0) {
      return [];
    }

    try {
      const contractValidators: ContractValidator[] = await Promise.all(
        addresses.map(async (address) => ({
          account: address,
          info: await this.dpos.getValidator(address),
        }))
      );

      return contractValidators.map((validator) =>
        this.mapContractToValidator(validator)
      );
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getValidatorsFor(address: string): Promise<Validator[]> {
    let validators: ContractValidator[] = [];
    let page = 0;
    let hasNextPage = true;

    while (hasNextPage) {
      try {
        const allValidators = await this.dpos.getValidatorsFor(address, page);
        validators = [...validators, ...allValidators.validators];
        hasNextPage = !allValidators.end;
        page++;
      } catch (e) {
        console.error(e);
        hasNextPage = false;
        return [];
      }
    }

    return validators.map((validator) =>
      this.mapContractToValidator(validator)
    );
  }

  async isValidatorEligible(
    validator: string
  ): Promise<ReturnType<DposAbi['isValidatorEligible']>> {
    return this.dpos.isValidatorEligible(validator);
  }

  async getDelegations(delegator: string): Promise<Delegation[]> {
    let delegations: ContractDelegation[] = [];
    let page = 0;
    let hasNextPage = true;

    while (hasNextPage) {
      try {
        const result = await this.dpos.getDelegations(delegator, page);
        delegations = [...delegations, ...result.delegations];
        hasNextPage = !result.end;
        page++;
      } catch (e) {
        console.error(e);
        hasNextPage = false;
        return [];
      }
    }

    return delegations.map((delegation: ContractDelegation) => ({
      address: delegation.account,
      stake: delegation.delegation.stake,
      rewards: delegation.delegation.rewards,
    }));
  }

  async getUndelegations(delegator: string): Promise<Undelegation[]> {
    let undelegations: ContractUndelegation[] = [];
    let page = 0;
    let hasNextPage = true;

    while (hasNextPage) {
      try {
        const result = await this.dpos.getUndelegations(delegator, page);
        undelegations = [...undelegations, ...result.undelegations];
        hasNextPage = !result.end;
        page++;
      } catch (e) {
        console.error(e);
        hasNextPage = false;
        return [];
      }
    }

    return undelegations.map((undelegation: ContractUndelegation) => ({
      address: undelegation.validator,
      stake: undelegation.stake,
      block: undelegation.block.toNumber(),
      validatorExists: undelegation.validator_exists,
    }));
  }

  async getValidatorEligibleVotesCount(validator: string): Promise<number> {
    const votes: ethers.BigNumber =
      await this.dpos.getValidatorEligibleVotesCount(validator);
    return votes.toNumber();
  }

  // Write methods
  async delegate(
    validator: string,
    amount: ethers.BigNumber
  ): Promise<ethers.ContractTransaction> {
    const contractWithSigner = await this.getContract();
    return contractWithSigner.delegate(validator, {
      value: amount,
    });
  }

  async undelegate(
    validator: string,
    amount: ethers.BigNumber
  ): Promise<ethers.ContractTransaction> {
    const contractWithSigner = await this.getContract();
    return contractWithSigner.undelegate(validator, amount);
  }

  async confirmUndelegate(
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const contractWithSigner = await this.getContract();
    return contractWithSigner.confirmUndelegate(validator);
  }

  async cancelUndelegate(
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const contractWithSigner = await this.getContract();
    return contractWithSigner.cancelUndelegate(validator);
  }

  async reDelegate(
    validatorFrom: string,
    validatorTo: string,
    amount: ethers.BigNumber
  ): Promise<ethers.ContractTransaction> {
    const contractWithSigner = await this.getContract();
    return contractWithSigner.reDelegate(validatorFrom, validatorTo, amount);
  }

  async claimRewards(validator: string): Promise<ethers.ContractTransaction> {
    const contractWithSigner = await this.getContract();
    return contractWithSigner.claimRewards(validator);
  }

  async claimCommissionRewards(
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const contractWithSigner = await this.getContract();
    return contractWithSigner.claimCommissionRewards(validator);
  }

  async registerValidator(
    validator: string,
    proof: string,
    vrfKey: string,
    commission: number,
    description: string,
    endpoint: string,
    customOverrides?: ethers.Overrides
  ): Promise<ethers.ContractTransaction> {
    const contractWithSigner = await this.getContract();
    return contractWithSigner.registerValidator(
      validator,
      proof,
      vrfKey,
      commission,
      description,
      endpoint,
      customOverrides
    );
  }

  async setValidatorInfo(
    validator: string,
    description: string,
    endpoint: string
  ): Promise<ethers.ContractTransaction> {
    const contractWithSigner = await this.getContract();
    return contractWithSigner.setValidatorInfo(
      validator,
      description,
      endpoint
    );
  }

  async setCommission(
    validator: string,
    commission: number
  ): Promise<ethers.ContractTransaction> {
    const contractWithSigner = await this.getContract();
    return contractWithSigner.setCommission(validator, commission);
  }

  async claimAllRewards(): Promise<ethers.ContractTransaction> {
    const contractWithSigner = await this.getContract();
    return contractWithSigner.claimAllRewards();
  }
}
