export interface AddressDetailsResponse {
  totalSent: string;
  totalReceived: string;
  priceAtTimeOfCalculation: string;
  currentBalance: string;
  currentValue: string;
  currency: 'USD' | 'GBP' | 'EUR';
}
