import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { User } from '@/user/User';
import { Room } from './room';
import { RoomNotFoundError } from './RoomNotFoundError';

@Injectable()
export class RoomService {
  private rooms = new Map<string, Room>();

  public createRoom(user: User, server: Server) {
    const room = new Room(user, server);

    this.rooms.set(room.id, room);

    return room;
  }

  public getRoom(id: string) {
    const room = this.rooms.get(id);

    if (!room) {
      throw new RoomNotFoundError(id);
    }

    return room;
  }

  public listRooms() {
    return Array.from(this.rooms.values()).map((room) =>
      room.getBasicDetails(),
    );
  }

  public removeRoom(id: string) {
    this.rooms.delete(id);
  }
}
