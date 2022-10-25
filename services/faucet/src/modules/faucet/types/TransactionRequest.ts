import { ethers } from 'ethers';

export class TransactionRequest {
  constructor(
    public timestamp: Date,
    public ip: string,
    public txRequest: ethers.providers.TransactionRequest
  ) {}
}
