export class UserNotFoundError extends Error {
  public name = UserNotFoundError.name;

  constructor(id: string) {
    super(`User "${id} not found."`);
  }
}
