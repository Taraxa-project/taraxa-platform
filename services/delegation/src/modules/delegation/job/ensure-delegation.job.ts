export class EnsureDelegationJob {
  constructor(
    public nodeId: number,
    public type: string,
    public address: string
  ) {}
}
