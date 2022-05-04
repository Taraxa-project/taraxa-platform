import { ethers } from 'ethers';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ethereum } from '@taraxa-claim/config';
import Claim from './contracts/Claim.json';

export enum ContractTypes {
  CLAIM,
}

@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;

  private contractInstances = {};

  constructor(
    @Inject(ethereum.KEY)
    ethereumConfig: ConfigType<typeof ethereum>,
  ) {
    this.provider = new ethers.providers.JsonRpcProvider({
      url: ethereumConfig.provider,
      timeout: 5000,
    });
  }
  getProvider() {
    return this.provider;
  }
  getContractInstance(type: ContractTypes, address: string): ethers.Contract {
    if (this.contractInstances[address]) {
      return this.contractInstances[address];
    }
    switch (type) {
      case ContractTypes.CLAIM:
        return (this.contractInstances[address] = new ethers.Contract(
          address,
          Claim,
          this.provider,
        ));
    }
  }
}
