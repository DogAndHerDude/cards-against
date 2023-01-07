import { Socket } from 'socket.io';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RoomService } from '@/room/room.service';
import { UserService } from '@/user/user.service';
import { AuthorizedSocket } from '@/sockets/AuthorizedSocket';

type RoomIdPartial = Record<string, unknown> & { roomID?: string };

@Injectable()
export class RoomOwnerGuard implements CanActivate {
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

    return room.owner === user;
  }
}
