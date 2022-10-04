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

    // this.testnetProvider.on('debug', (message) => {
    //   const { action, request, response, error } = message;
    //   console.log({
    //     action,
    //     request,
    //     response,
    //     error
    //   })
    // });

    this.testnetWallet = new ethers.Wallet(
      ethereum.testnetDelegationWallet,
      this.testnetProvider,
    );

    this.testnetDelegationContract = new ethers.Contract(
      '0x00000000000000000000000000000000000000fe',
      [
        'function registerValidator(address validator, bytes proof, bytes vrf_key, uint16 commission, string description, string endpoint) payable',
        'function getValidator(address validator) view returns (tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, string description, string endpoint) validator_info)',
        'function getValidators(uint32 batch) view returns (tuple(address account, tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, string description, string endpoint) info)[] validators, bool end)',
      ],
      this.testnetProvider,
    ).connect(this.testnetWallet);

    this.testnetDelegationAmount = delegation.testnetDelegation;
  }

  getValidator(address: string) {
    return this.testnetDelegationContract.getValidator(address);
  }

  async registerValidator(
    address: string,
    addressProof: string,
    vrfKey: string,
    name = '',
  ) {
    try {
      const receipt = await this.testnetDelegationContract.registerValidator(
        address,
        addressProof,
        vrfKey,
        0,
        name,
        '',
        {
          gasLimit: 120000,
          value: this.testnetDelegationAmount,
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
