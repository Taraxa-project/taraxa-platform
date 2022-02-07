import Node from './Node';

export default interface PublicNode extends Node {
  user: number;
  isTopNode: boolean;
  canUndelegate: boolean;
}
