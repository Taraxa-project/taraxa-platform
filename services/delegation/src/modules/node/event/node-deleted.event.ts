export class NodeDeletedEvent {
  constructor(
    public nodeId: number,
    public type: string,
    public address: string
  ) {}
}
