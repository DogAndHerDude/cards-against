export class BadEventError extends Error {
  public static readonly message = 'Bad incoming event.';

  constructor() {
    super(BadEventError.message);
  }
}
