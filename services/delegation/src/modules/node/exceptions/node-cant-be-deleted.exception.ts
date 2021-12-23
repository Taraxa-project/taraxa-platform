export class NodeCantBeDeletedException extends Error {
  constructor(id: number) {
    super(`Node with id ${id} can't be deleted`);
    this.name = 'NodeCantBeDeletedException';
  }
}
