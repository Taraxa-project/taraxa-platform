export class NodeCreatedEvent {
  constructor(
    public nodeId: number,
    public type: string,
    public address: string,
  ) {}
}
