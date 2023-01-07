import { Socket } from 'socket.io';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RoomService } from '@/room/room.service';
import { UserService } from '@/user/user.service';
import { AuthorizedSocket } from '@/sockets/AuthorizedSocket';

type roomIdPartial = Record<string, unknown> & { roomId?: string };

@Injectable()
export class RoomOwnerGuard implements CanActivate {
  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService,
  ) {}

  public canActivate(context: ExecutionContext) {
    const host = context.switchToWs();
    const client = host.getClient<AuthorizedSocket | Socket>();
    const { roomId } = host.getData<roomIdPartial>();

    if (!('user' in client) || !roomId) {
      return false;
    }

    const user = this.userService.getUser(client.user.id);
    const room = this.roomService.getRoom(roomId);

    return room.owner === user;
  }
}
