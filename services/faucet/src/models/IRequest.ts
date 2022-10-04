export interface IRequest {
  id?: number;
  address: string;
  ipv4: string;
  txHash: string;
  amount: number;
  createdAt: Date;
}
