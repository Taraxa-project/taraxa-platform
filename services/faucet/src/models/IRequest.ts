export interface IRequest {
  id?: number;
  uuid: string;
  address: string;
  ip: string;
  txHash?: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}
