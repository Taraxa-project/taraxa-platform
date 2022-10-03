import { ethers } from 'ethers';

export class TransactionRequest {
  constructor(
    public timestamp: Date,
    public ipv4: string,
    public txRequest: ethers.providers.TransactionRequest
  ) {}
}
