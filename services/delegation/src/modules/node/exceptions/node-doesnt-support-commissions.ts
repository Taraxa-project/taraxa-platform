export class NodeDoesntSupportCommissionsException extends Error {
  constructor(node: number) {
    super(`Node with id ${node} doesn't support commissions.`);
    this.name = 'NodeDoesntSupportCommissionsException';
  }
}
