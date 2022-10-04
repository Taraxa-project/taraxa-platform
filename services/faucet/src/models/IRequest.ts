export interface IRequest {
  id?: number;
  address: string;
  ip: string;
  txHash: string;
  amount: number;
  createdAt: Date;
}
