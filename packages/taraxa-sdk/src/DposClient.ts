import { ethers } from 'ethers';
import { DposAbi, DposAbi__factory as Dpos } from '../types/ethers-contracts';
import { DPOS_CONTRACT_ADDRESS } from './networks';

class DposContractClient {
  private dposInterface: DposAbi;

  private provider: ethers.providers.Provider;

  private chainID: number;

  constructor(provider: ethers.providers.Provider, chainID: number) {
    this.dposInterface = Dpos.connect(DPOS_CONTRACT_ADDRESS, provider);
    this.provider = provider;
    this.chainID = chainID;
  }

  async getTotalEligibleVotesCount(): Promise<number> {
    const totalVotes: ethers.BigNumber = await this.dposInterface.getTotalEligibleVotesCount();
    return totalVotes.toNumber();
  }

  async getValidator(
    validator: string
  ): Promise<ReturnType<DposAbi['getValidator']>> {
    return this.dposInterface.getValidator(validator);
  }

  async delegate(
    signer: ethers.Wallet,
    amount: ethers.BigNumber,
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const overrides = await this.createNewTransactOpts(signer);
    const contractWithSigner = this.dposInterface.connect(signer);
    return contractWithSigner.delegate(validator, {
      ...overrides,
      value: amount,
    });
  }

  async undelegate(
    signer: ethers.Wallet,
    amount: ethers.BigNumber,
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const overrides = await this.createNewTransactOpts(signer);
    const contractWithSigner = this.dposInterface.connect(signer);
    return contractWithSigner.undelegate(validator, amount, overrides);
  }

  async confirmUndelegate(
    signer: ethers.Wallet,
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const overrides = await this.createNewTransactOpts(signer);
    const contractWithSigner = this.dposInterface.connect(signer);
    return contractWithSigner.confirmUndelegate(validator, overrides);
  }

  async cancelUndelegate(
    signer: ethers.Wallet,
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const overrides = await this.createNewTransactOpts(signer);
    const contractWithSigner = this.dposInterface.connect(signer);
    return contractWithSigner.cancelUndelegate(validator, overrides);
  }

  async reDelegate(
    signer: ethers.Wallet,
    amount: ethers.BigNumber,
    validatorFrom: string,
    validatorTo: string
  ): Promise<ethers.ContractTransaction> {
    const overrides = await this.createNewTransactOpts(signer);
    const contractWithSigner = this.dposInterface.connect(signer);
    return contractWithSigner.reDelegate(
      validatorFrom,
      validatorTo,
      amount,
      overrides
    );
  }

  async claimRewards(
    signer: ethers.Wallet,
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const overrides = await this.createNewTransactOpts(signer);
    const contractWithSigner = this.dposInterface.connect(signer);
    return contractWithSigner.claimRewards(validator, overrides);
  }

  async claimCommissionRewards(
    signer: ethers.Wallet,
    validator: string
  ): Promise<ethers.ContractTransaction> {
    const overrides = await this.createNewTransactOpts(signer);
    const contractWithSigner = this.dposInterface.connect(signer);
    return contractWithSigner.claimCommissionRewards(validator, overrides);
  }

  async registerValidator(
    signer: ethers.Wallet,
    validator: string,
    proof: Uint8Array,
    vrf_key: Uint8Array,
    commission: number,
    description: string,
    endpoint: string
  ): Promise<ethers.ContractTransaction> {
    const overrides = await this.createNewTransactOpts(signer);
    const contractWithSigner = this.dposInterface.connect(signer);
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
    signer: ethers.Wallet,
    validator: string,
    description: string,
    endpoint: string
  ): Promise<ethers.ContractTransaction> {
    const overrides = await this.createNewTransactOpts(signer);
    const contractWithSigner = this.dposInterface.connect(signer);
    return contractWithSigner.setValidatorInfo(
      validator,
      description,
      endpoint,
      overrides
    );
  }

  async setCommission(
    signer: ethers.Wallet,
    validator: string,
    commission: number
  ): Promise<ethers.ContractTransaction> {
    const overrides = await this.createNewTransactOpts(signer);
    const contractWithSigner = this.dposInterface.connect(signer);
    return contractWithSigner.setCommission(validator, commission, overrides);
  }

  async createNewTransactOpts(
    signer: ethers.Wallet
  ): Promise<ethers.Overrides> {
    const nonce = await this.provider.getTransactionCount(
      signer.address,
      'pending'
    );
    const gasPrice = await this.provider.getGasPrice();

    return {
      nonce,
      gasLimit: ethers.BigNumber.from(300000),
      gasPrice,
    };
  }
}

// Usage example:
const provider = new ethers.providers.JsonRpcProvider('your-provider-url');
const chainID = 1; // Replace with your chain ID
const client = new DposContractClient(provider, chainID);

client.getTotalEligibleVotesCount().then(totalVotes => {
  // eslint-disable-next-line no-console
  console.log('Total Eligible Votes:', totalVotes);
});
