export default interface BackendDelegation {
  id: number;
  user: number;
  address: string;
  value: number;
  createdAt: string;
  isOwnDelegation: boolean;
  isSelfDelegation: boolean;
}
