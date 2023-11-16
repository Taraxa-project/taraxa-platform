export interface AddressInfoDetails {
  address: string;
  label: string | null;
  balance: string;
  value: string;
  valueCurrency: string;
  transactionCount: number;
  dagBlocks: number;
  pbftBlocks: number;
  pricePerTara: number;
}
