export class EnsureNodeOnchainJob {
  constructor(
    public nodeId: number,
    public type: string,
    public address: string
  ) {}
}
