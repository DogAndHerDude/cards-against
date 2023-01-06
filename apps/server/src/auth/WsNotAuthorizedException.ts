import { WsException } from '@nestjs/websockets';

export class WsNotAuthorizedException extends WsException {
  public static readonly message = 'Not authorized.';

  public readonly name = WsNotAuthorizedException.name;

  constructor() {
    super(WsNotAuthorizedException.message);
  }
}
