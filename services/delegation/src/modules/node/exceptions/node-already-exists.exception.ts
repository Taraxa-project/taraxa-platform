export class NodeAlreadyExistsException extends Error {
  constructor(address: string) {
    super(`Node with address ${address} already exists`);
    this.name = 'NodeAlreadyExistsException';
  }
}
