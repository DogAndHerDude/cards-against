import { WsException } from '@nestjs/websockets';

export class WsInternalServerErrorException extends WsException {
  public static readonly message = 'Internal server error.';

  public name = WsInternalServerErrorException.name;

  constructor() {
    super(WsInternalServerErrorException.message);
  }
}
