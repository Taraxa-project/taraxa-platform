export class NodeCreatedEvent {
  constructor(
    public nodeId: number,
    public type: string,
    public address: string,
    public addressProof: string,
    public vrfKey: string,
  ) {}
}
