export default interface Delegation {
  id: number;
  user: number;
  address: string;
  value: number;
  createdAt: string;
  isOwnDelegation: boolean;
  isSelfDelegation: boolean;
}
