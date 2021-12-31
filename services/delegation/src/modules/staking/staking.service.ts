import { ethers } from 'ethers';
import Web3 from 'web3';
import * as RLP from 'rlp';
import * as ethUtil from 'ethereumjs-util';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StakingService {
  private ethProvider: ethers.providers.JsonRpcProvider;
  private mainnetProvider: Web3;
  private mainnetWallet;
  private contract: ethers.Contract;

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
  }
  async getStakingAmount(address: string): Promise<number> {
    const stakeOf = await this.contract.stakeOf(address);
    return stakeOf[0].div(ethers.BigNumber.from(10).pow(18)).toNumber();
  }
  async getMainnetStake(address: string): Promise<number> {
    const formattedAddress = address.toLocaleLowerCase();
    const mainnetEndpoint = this.config.get<string>('ethereum.mainnetEndpoint');
    const payload = {
      jsonrpc: '2.0',
      method: 'taraxa_queryDPOS',
      params: [
        {
          account_queries: {
            [formattedAddress]: {
              inbound_deposits_addrs_only: false,
              outbound_deposits_addrs_only: false,
              with_inbound_deposits: true,
              with_outbound_deposits: true,
              with_staking_balance: true,
            },
          },
          with_eligible_count: true,
        },
      ],
      id: 1,
    };
    const state = await this.httpService
      .post(mainnetEndpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .toPromise();

    if (state.status !== 200) {
      throw new Error('Failed to get mainnet stake');
    }

    return parseInt(
      state.data.result.account_results[formattedAddress].staking_balance,
      16,
    );
  }
  async delegateTestnetTransaction(address: string) {
    const explorerUrl = this.config.get<string>('ethereum.testnetExplorerUrl');

    await this.httpService
      .get(
        `${explorerUrl}/api/delegate/${address}?sig=${this.getSignature(
          address,
        )}`,
      )
      .toPromise();
  }

  async undelegateTestnetTransaction(address: string) {
    const explorerUrl = this.config.get<string>('ethereum.testnetExplorerUrl');

    await this.httpService
      .get(
        `${explorerUrl}/api/undelegate/${address}?sig=${this.getSignature(
          address,
        )}`,
      )
      .toPromise();
  }
  async delegateMainnetTransaction(address: string, value: number) {
    await this.sendMainnetTransaction(
      '0x00000000000000000000000000000000000000ff',
      `0x${this.bufferToHex(RLP.encode([[address, [value, 0]]]))}`,
    );
  }

  async undelegateMainnetTransaction(address: string, value: number) {
    await this.sendMainnetTransaction(
      '0x00000000000000000000000000000000000000ff',
      `0x${this.bufferToHex(RLP.encode([[address, [value, 1]]]))}`,
    );
  }
  private async sendMainnetTransaction(
    to: string,
    input: string,
  ): Promise<boolean> {
    const tx = await this.mainnetWallet.signTransaction({
      from: this.mainnetWallet.address,
      to,
      value: 0,
      gas: 30000,
      gasPrice: 0,
      nonce:
        (await this.mainnetProvider.eth.getTransactionCount(
          this.mainnetWallet.address,
        )) + 1,
      input,
    });

    return await new Promise((resolve, reject) => {
      this.mainnetProvider.eth
        .sendSignedTransaction(tx.rawTransaction)
        .on('transactionHash', () => {
          resolve(true);
        })
        .on('error', () => {
          reject(false);
        });
    });
  }

  private bufferToHex(buffer: Buffer): string {
    return [...new Uint8Array(buffer)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private getSignature(address: string): string {
    const privKey = this.config.get<string>('ethereum.testnetWallet');

    const { v, r, s } = ethUtil.ecsign(
      ethUtil.keccak256(ethUtil.toBuffer(address)),
      Buffer.from(privKey.substring(2), 'hex'),
    );
    const hash = ethUtil.toRpcSig(v, r, s);

    return hash;
  }
}
