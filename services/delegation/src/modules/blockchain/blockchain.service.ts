import * as ethers from 'ethers';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import ethereumConfig from '../../config/ethereum';
import delegationConfig from '../../config/delegation';

@Injectable()
export class BlockchainService {
  private testnetProvider: ethers.providers.JsonRpcProvider;
  private testnetWallet: ethers.Wallet;
  private testnetDelegationContract: ethers.Contract;
  private testnetDelegationAmount: ethers.BigNumber;
  private testnetOwnNodes: string[];

  constructor(
    @Inject(ethereumConfig.KEY)
    ethereum: ConfigType<typeof ethereumConfig>,
    @Inject(delegationConfig.KEY)
    delegation: ConfigType<typeof delegationConfig>,
  ) {
    this.testnetProvider = new ethers.providers.JsonRpcProvider({
      url: ethereum.testnetEndpoint,
      timeout: 2000,
    });

    this.testnetWallet = new ethers.Wallet(
      ethereum.testnetDelegatorWallet,
      this.testnetProvider,
    );

    this.testnetDelegationContract = new ethers.Contract(
      '0x00000000000000000000000000000000000000fe',
      [
        'function delegate(address validator) payable',
        'function registerValidator(address validator, bytes proof, bytes vrf_key, uint16 commission, string description, string endpoint) payable',
        'function getValidator(address validator) view returns (tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, string description, string endpoint) validator_info)',
        'function getValidators(uint32 batch) view returns (tuple(address account, tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, string description, string endpoint) info)[] validators, bool end)',
      ],
      this.testnetProvider,
    ).connect(this.testnetWallet);

    this.testnetDelegationAmount = delegation.testnetDelegation;
    this.testnetOwnNodes = delegation.testnetOwnNodes;
  }

  getValidator(address: string) {
    return this.testnetDelegationContract.getValidator(address);
  }

  async registerValidator(
    address: string,
    addressProof: string,
    vrfKey: string,
  ) {
    if (this.testnetOwnNodes.length == 0) {
      console.error(`Can't delegate to own nodes - No own nodes.`);
    }
    try {
      const randomIndex = Math.floor(
        Math.random() * this.testnetOwnNodes.length,
      );
      const ownNode = this.testnetOwnNodes[randomIndex];
      const tx = await this.testnetDelegationContract.delegate(ownNode, {
        gasLimit: 120000,
        value: this.testnetDelegationAmount.mul(2).toString(),
      });
      await tx.wait();
    } catch (e) {
      console.error(`Could not delegate to own nodes`, e);
    }

    try {
      const receipt = await this.testnetDelegationContract.registerValidator(
        address,
        addressProof,
        vrfKey,
        0,
        '',
        '',
        {
          gasLimit: 120000,
          value: this.testnetDelegationAmount.toString(),
        },
      );
      await receipt.wait();
      return true;
    } catch (e) {
      console.error(`Could not create validator`, e);
    }

    return false;
  }
}
