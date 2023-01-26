export interface AddressDetailsResponse {
  priceAtTimeOfCalculation: string;
  currentBalance: string;
  currentValue: string;
  currency: 'USD' | 'GBP' | 'EUR';
}
