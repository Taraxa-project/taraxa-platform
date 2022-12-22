import { ethers } from "ethers";
import Web3 from "web3";
import { Account } from "web3-core";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class StakingService {
  private ethProvider: ethers.providers.JsonRpcProvider;
  private mainnetProvider: Web3;
  private mainnetWallet: Account;
  private testnetProvider: Web3;
  private testnetWallet: Account;
  private stakingContract: ethers.Contract;

  constructor(private config: ConfigService, private httpService: HttpService) {
    this.ethProvider = new ethers.providers.JsonRpcProvider(
      this.config.get<string>("ethereum.ethEndpoint")
    );

    this.stakingContract = new ethers.Contract(
      this.config.get<string>("staking.contract"),
      ["function stakeOf(address) view returns (uint,uint,uint)"],
      this.ethProvider
    );

    this.mainnetProvider = new Web3(
      this.config.get<string>("ethereum.mainnetEndpoint")
    );
    this.mainnetWallet = this.mainnetProvider.eth.accounts.privateKeyToAccount(
      this.config.get<string>("ethereum.mainnetWallet")
    );

    this.testnetProvider = new Web3(
      this.config.get<string>("ethereum.testnetEndpoint")
    );
    this.testnetWallet = this.testnetProvider.eth.accounts.privateKeyToAccount(
      this.config.get<string>("ethereum.testnetWallet")
    );
  }
  get mainnetWalletAddress(): string {
    return this.mainnetWallet.address;
  }
  get testnetWalletAddress(): string {
    return this.testnetWallet.address;
  }
  async getStakingAmount(address: string): Promise<number> {
    const stakeOf = await this.stakingContract.stakeOf(address);
    return stakeOf[0].div(ethers.BigNumber.from(10).pow(18)).toNumber();
  }
}
