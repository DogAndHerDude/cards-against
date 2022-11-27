import { WsException } from '@nestjs/websockets';

export class WsUserNotFoundException extends WsException {
  public static readonly message = 'User not found.';

  public name = WsUserNotFoundException.name;

  constructor() {
    super(WsUserNotFoundException.message);
  }
}
