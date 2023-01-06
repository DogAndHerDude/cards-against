import { Exclude } from 'class-transformer';
import { Socket } from 'socket.io';
import { v4 } from 'uuid';

export class User {
  public readonly id = v4();

  @Exclude({ toPlainOnly: true })
  public socket?: Socket;

  constructor(public readonly name: string) {}

  @Exclude({ toPlainOnly: true })
  public setSocket(socket: Socket) {
    this.socket = socket;
  }
}
