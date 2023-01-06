export class NotRoomOwnerError extends Error {
  public static readonly message = 'User is not the room owner.';

  constructor() {
    super(NotRoomOwnerError.message);
  }
}
