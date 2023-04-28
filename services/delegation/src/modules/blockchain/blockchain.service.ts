import * as ethers from 'ethers';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(
    endpoint: string,
    walletKey: string,
    public defaultDelegationAmount: ethers.BigNumber,
    dposProxyAddress: string,
  ) {
    this.provider = new ethers.providers.JsonRpcProvider({
      url: endpoint,
      timeout: 2000,
    });

    this.wallet = new ethers.Wallet(walletKey, this.provider);

    this.contract = new ethers.Contract(
      dposProxyAddress,
      [
        'function delegate(address validator) payable',
        'function undelegate(address validator, uint256 amount) external',
        'function confirmUndelegate(address validator) external',
        'function cancelUndelegate(address validator) external',
        'function getValidator(address validator) view returns (tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, address owner, string description, string endpoint) validator_info)',
        'function getValidators(uint32 batch) view returns (tuple(address account, tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, address owner, string description, string endpoint) info)[] validators, bool end)',
        'function registerValidator(address validator, bytes proof, bytes vrf_key, uint16 commission, string description, string endpoint) payable',
      ],
      this.provider,
    ).connect(this.wallet);
  }

  static create(
    endpoint: string,
    walletKey: string,
    defaultDelegationAmount: ethers.BigNumber,
    dposProxyAddress: string,
  ) {
    return new BlockchainService(
      endpoint,
      walletKey,
      defaultDelegationAmount,
      dposProxyAddress,
    );
  }

  async getCurrentBlockNumber() {
    return await this.provider.getBlockNumber();
  }

  async getValidator(address: string) {
    const {
      total_stake,
      commission_reward,
      commission,
      description,
      endpoint,
    } = await this.contract.getValidator(address);
    return {
      total_stake,
      commission_reward,
      commission,
      description,
      endpoint,
    };
  }

  async registerValidator(
    address: string,
    addressProof: string,
    vrfKey: string,
  ) {
    try {
      const validatorData = await this.contract.getValidator(address);
      if (validatorData && validatorData.owner) return true;

      const tx = await this.contract.registerValidator(
        address,
        addressProof,
        vrfKey,
        0,
        '',
        '',
        {
          gasPrice: this.provider.getGasPrice(),
          value: this.defaultDelegationAmount,
        },
      );
      await tx.wait();
      return true;
    } catch (e) {
      console.error(`Could not create validator ${address}`, e);
    }
    return false;
  }

  async delegate(address: string, amount: ethers.BigNumber) {
    try {
      const tx = await this.contract.delegate(address, {
        gasPrice: this.provider.getGasPrice(),
        value: amount,
      });
      await tx.wait();
      return true;
    } catch (e) {
      console.error(
        `Could not delegate ${amount.toString()} TARA to validator ${address}`,
        e,
      );
    }

    return false;
  }

  async undelegate(address: string, amount: ethers.BigNumber) {
    const tx = await this.contract.undelegate(address, amount, {
      gasPrice: this.provider.getGasPrice(),
    });
    const receipt = await tx.wait();
    return receipt.blockNumber;
  }

  async confirmUndelegate(address: string) {
    const tx = await this.contract.confirmUndelegate(address, {
      gasPrice: this.provider.getGasPrice(),
    });
    const receipt = await tx.wait();
    return receipt.blockNumber;
  }
}
