import { Socket } from 'socket.io';
import { v4 } from 'uuid';

export type PlainUser = {
  id: string;
  name: string;
};

export class User {
  public readonly id = v4();

  constructor(public readonly name: string, public readonly socket: Socket) {}

  toPlain(): PlainUser {
    return {
      id: this.id,
      name: this.name,
    };
  }
}
