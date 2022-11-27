import { Socket } from 'socket.io';

export class AuthorizedSocket extends Socket {
  public user: { id: string };
}
