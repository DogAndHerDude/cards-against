import { WsException } from '@nestjs/websockets';

export class WsRoomNotFoundException extends WsException {
  public static readonly message = 'Room not found.';

  constructor() {
    super(WsRoomNotFoundException.message);
  }
}
