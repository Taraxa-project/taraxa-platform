export class CantAddCommissionException extends Error {
  constructor(node: number) {
    super(`Node with id ${node} already has a pending commission change.`);
    this.name = 'CantAddCommissionException';
  }
}
