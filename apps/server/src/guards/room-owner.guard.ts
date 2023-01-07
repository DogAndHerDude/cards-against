import { Socket } from 'socket.io';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { RoomService } from '@/room/room.service';
import { UserService } from '@/user/user.service';
import { AuthorizedSocket } from '@/sockets/AuthorizedSocket';

type RoomIdPartial = Record<string, unknown> & { roomID?: string };

export class OwnerGuard implements CanActivate {
  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService,
  ) {}

  public canActivate(context: ExecutionContext) {
    const host = context.switchToWs();
    const client = host.getClient<AuthorizedSocket | Socket>();
    const { roomID } = host.getData<RoomIdPartial>();

    if (!('user' in client) || !roomID) {
      return false;
    }

    const user = this.userService.getUser(client.user.id);
    const room = this.roomService.getRoom(roomID);

    if (!user || !room) {
      return false;
    }

    return room.owner === user;
  }
}
