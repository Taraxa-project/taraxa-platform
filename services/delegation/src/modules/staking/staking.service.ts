import { ethers } from 'ethers';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StakingService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(private config: ConfigService) {
    this.provider = new ethers.providers.JsonRpcProvider(
      config.get<string>('ethereum.endpoint'),
    );

    this.contract = new ethers.Contract(
      config.get<string>('staking.contract'),
      ['function stakeOf(address) view returns (uint,uint,uint)'],
      this.provider,
    );
  }
  async getStakingAmount(address: string): Promise<number> {
    const stakeOf = await this.contract.stakeOf(address);
    return stakeOf[0].div(ethers.BigNumber.from(10).pow(18)).toNumber();
  }
}
