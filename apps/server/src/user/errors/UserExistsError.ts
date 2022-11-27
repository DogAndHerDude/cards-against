export class UserExistsError extends Error {
  public name = UserExistsError.name;

  constructor(name: string) {
    super(`User "${name}" already exists`);
  }
}
