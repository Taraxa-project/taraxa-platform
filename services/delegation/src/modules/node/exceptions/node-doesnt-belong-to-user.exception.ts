export class NodeDoesntBelongToUserException extends Error {
  constructor(node: number) {
    super(`Node with id ${node} doesn't belong to user`);
    this.name = 'NodeAlreadyExistsException';
  }
}
