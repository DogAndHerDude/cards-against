export class GameNotInProgressError extends Error {
  public static readonly message = 'Game is not in progress.';

  constructor() {
    super(GameNotInProgressError.message);
  }
}
