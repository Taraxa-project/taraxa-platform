export class NodeNotFoundException extends Error {
  constructor(id: number) {
    super(`Node with id ${id} was not found`);
    this.name = 'NodeNotFoundException';
  }
}
