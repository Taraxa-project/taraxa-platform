import { ethers } from 'ethers';
import Web3 from 'web3';
import { Account } from 'web3-core';
import * as RLP from 'rlp';
import * as ethUtil from 'ethereumjs-util';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class StakingService {
  private ethProvider: ethers.providers.JsonRpcProvider;
  private mainnetProvider: Web3;
  private mainnetWallet: Account;
  private testnetProvider: Web3;
  private testnetWallet: Account;
  private contract: ethers.Contract;
  private dposContractAddress = '0x00000000000000000000000000000000000000ff';
  private testnetExplorerUrl: string;
  public testnetFaucetWalletAddress: string;

  constructor(private config: ConfigService, private httpService: HttpService) {
    this.ethProvider = new ethers.providers.JsonRpcProvider(
      this.config.get<string>('ethereum.ethEndpoint'),
    );

    this.contract = new ethers.Contract(
      this.config.get<string>('staking.contract'),
      ['function stakeOf(address) view returns (uint,uint,uint)'],
      this.ethProvider,
    );

    this.mainnetProvider = new Web3(
      this.config.get<string>('ethereum.mainnetEndpoint'),
    );
    this.mainnetWallet = this.mainnetProvider.eth.accounts.privateKeyToAccount(
      this.config.get<string>('ethereum.mainnetWallet'),
    );

    this.testnetProvider = new Web3(
      this.config.get<string>('ethereum.testnetEndpoint'),
    );
    this.testnetWallet = this.testnetProvider.eth.accounts.privateKeyToAccount(
      this.config.get<string>('ethereum.testnetWallet'),
    );

    this.testnetExplorerUrl = this.config.get<string>(
      'ethereum.testnetExplorerUrl',
    );
    this.testnetFaucetWalletAddress = this.config.get<string>(
      'ethereum.testnetFaucetWalletAddress',
    );
  }
  get mainnetWalletAddress(): string {
    return this.mainnetWallet.address;
  }
  get testnetWalletAddress(): string {
    return this.testnetWallet.address;
  }

  async getStakingAmount(address: string): Promise<number> {
    const stakeOf = await this.contract.stakeOf(address);
    return stakeOf[0].div(ethers.BigNumber.from(10).pow(18)).toNumber();
  }

  async delegateMainnetTransaction(address: string, value: ethers.BigNumber) {
    await this.sendMainnetTransaction(
      this.dposContractAddress,
      this.getDPOSInput(address, value, 'add'),
    );
  }

  async undelegateMainnetTransaction(address: string, value: ethers.BigNumber) {
    await this.sendMainnetTransaction(
      this.dposContractAddress,
      this.getDPOSInput(address, value, 'substract'),
    );
  }

  async delegateTestnetTransaction(address: string) {
    await this.httpService
      .get(
        `${
          this.testnetExplorerUrl
        }/api/delegate/${address}?sig=${this.getSignature(address)}`,
      )
      .toPromise();
  }

  async undelegateTestnetTransaction(address: string) {
    await this.httpService
      .get(
        `${
          this.testnetExplorerUrl
        }/api/undelegate/${address}?sig=${this.getSignature(address)}`,
      )
      .toPromise();
  }

  private async sendMainnetTransaction(
    to: string,
    input: string,
  ): Promise<boolean> {
    return this.sendTransaction(to, input, 'mainnet');
  }

  private async sendTransaction(
    to: string,
    input: string,
    type: 'testnet' | 'mainnet',
  ): Promise<boolean> {
    const from =
      type === 'testnet'
        ? this.testnetWalletAddress
        : this.mainnetWalletAddress;

    const ethProvider = (
      type === 'testnet' ? this.testnetProvider : this.mainnetProvider
    ).eth;

    const wallet = type === 'testnet' ? this.testnetWallet : this.mainnetWallet;

    const nonce = (await ethProvider.getTransactionCount(from)) + 1;
    const tx = {
      from,
      to,
      nonce,
      input,
      gas: 30000,
      value: 0,
      gasPrice: 0,
    };
    const signedTx = await wallet.signTransaction(tx);

    return await new Promise((resolve, reject) => {
      ethProvider
        .sendSignedTransaction(signedTx.rawTransaction)
        .on('transactionHash', () => {
          resolve(true);
        })
        .on('error', () => {
          reject(false);
        });
    });
  }

  private getDPOSInput(
    address: string,
    value: ethers.BigNumber,
    type: 'add' | 'substract',
  ): string {
    return `0x${this.bufferToHex(
      Buffer.from(
        RLP.encode([[address, [value.toHexString(), type === 'add' ? 0 : 1]]]),
      ),
    )}`;
  }

  private bufferToHex(buffer: Buffer): string {
    return [...new Uint8Array(buffer)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private getSignature(address: string): string {
    const privKey = this.config.get<string>('ethereum.testnetDelegationWallet');

    const { v, r, s } = ethUtil.ecsign(
      ethUtil.keccak256(ethUtil.toBuffer(address)),
      Buffer.from(privKey.substring(2), 'hex'),
    );
    const hash = ethUtil.toRpcSig(v, r, s);

    return hash;
  }
}
