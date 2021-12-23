export class NodeProofInvalidException extends Error {
  constructor(address: string) {
    super(`Node proof for ${address} is invalid`);
    this.name = 'NodeProofInvalidException';
  }
}
