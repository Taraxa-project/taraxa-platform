import Node from './Node';

export default interface OwnNode extends Node {
  ip: string;
  type: 'mainnet' | 'testnet';
  commissions: any[];
  canDelete: boolean;
}
