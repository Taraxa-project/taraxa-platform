export interface AddressDetailsResponse {
  totalSent: string;
  totalReceived: string;
  priceAtTimeOfCalcualtion: string;
  currentBalance: string;
  currentValue: string;
  currency: 'USD' | 'GBP' | 'EUR';
}
