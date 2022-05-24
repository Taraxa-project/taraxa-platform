interface Node {
  id: number;
  name: string;
  address: string;
}

export default interface Reward {
  id: number;
  user: number;
  userAddress: string;
  node: Node;
  type: string;
  epoch: number;
  value: number;
  commission: number;
  originalAmount: number;
  startsAt: string;
  endsAt: string;
}
