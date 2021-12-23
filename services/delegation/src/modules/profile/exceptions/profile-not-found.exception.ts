export class ProfileNotFoundException extends Error {
  constructor(user: number) {
    super(`User ${user} doesn't have a profile`);
    this.name = 'ProfileNotFoundException';
  }
}
