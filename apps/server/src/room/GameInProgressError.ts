export class GameInProgressError extends Error {
  public static readonly message = 'Game is already in progress.';

  constructor() {
    super(GameInProgressError.message);
  }
}
