export interface ITaraxaAddress {
  pubKey: string;
  transactionCount: number;
  isContract: boolean;
  balance: string;
  totalSent: string;
  totalReceived: string;
  totalMined: string;
}
