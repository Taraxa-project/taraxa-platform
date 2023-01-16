import { ethers } from 'ethers';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ethereum } from '@faucet/config';

@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(
    @Inject(ethereum.KEY)
    ethereumConfig: ConfigType<typeof ethereum>
  ) {
    this.provider = new ethers.providers.JsonRpcProvider({
      url: ethereumConfig.provider!,
      timeout: 2000,
    });
    this.wallet = new ethers.Wallet(
      ethereumConfig.privateSigningKey!,
      this.provider
    );
  }
  public getProvider(): ethers.providers.Provider {
    return this.provider;
  }
  public getWallet(): ethers.Wallet {
    return this.wallet;
  }
}
