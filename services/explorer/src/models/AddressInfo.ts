export interface AddressInfoDetails {
  address: string;
  balance: string;
  value: string;
  valueCurrency: string;
  transactionCount: number;
  totalReceived: string;
  totalSent: string;
  fees: string;
  dagBlocks: number;
  pbftBlocks: number;
  pricePerTara: number;
}
