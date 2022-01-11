import { NodeType } from '../node-type.enum';

export class NodeCreatedEvent {
  constructor(public nodeId: number, public type: NodeType) {}
}
