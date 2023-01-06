import { WsException } from '@nestjs/websockets';

export class WsInvalidCredentialsException extends WsException {
  public static readonly message = 'Invalid credentials.';

  public readonly name = WsInvalidCredentialsException.name;

  constructor() {
    super(WsInvalidCredentialsException.message);
  }
}
