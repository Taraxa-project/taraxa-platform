export class ProfileAlreadyExistsException extends Error {
  constructor(user: number) {
    super(`User ${user} already has a profile`);
    this.name = 'ProfileAlreadyExistsException';
  }
}
