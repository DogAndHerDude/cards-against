import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JsonWebTokenError } from 'jsonwebtoken';
import { SOCKET_GATEWAY_ERRORS } from './gateway.errors';
import { UserService } from '@/user/user.service';
import { AuthService } from '@/auth/auth.service';
import { RoomService } from '@/room/room.service';
import { AuthorizedSocket } from './AuthorizedSocket';
import {
  IncomingRoomEvents,
  InternalRoomEvents,
  OutgoingRoomEvents,
} from '@/room/events';
import { StartGameDTO } from './dto/StartGameDTO';
import { UserNotFoundError } from '@/user/errors/UserNotFoundError';
import { WsUserNotFoundException } from './errors/WsUserNotFoundException';
import { WsInternalServerErrorException } from './errors/WsInternalServerErrorException';
import { GameEventDTO } from './dto/GameEventDTO';
import { RoomNotFoundError } from '@/room/RoomNotFoundError';
import { WsRoomNotFoundException } from './errors/WsRoomNotFoundException';
import { UseGuards } from '@nestjs/common';
import { SocketAuthGuard } from '@/guards/auth.guard';
import { RoomOwnerGuard } from '@/guards/room-owner.guard';
import { RoomUserGuard } from '@/guards/room-user.guard';
import { JoinRoomDTO } from './dto/JoinRoomDTO';
import { User } from '@/user/User';
import { LeaveRoomDTO } from './dto/LeaveRoom.dto';
import { GetRoomDTO } from './dto/get-room.dto';

/*
 * TODOs:
 * 1. Refactor enums to const
 */

@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server!: Server;

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly roomService: RoomService,
  ) {}

  public async handleConnection(socket: Socket): Promise<void> {
    const { auth } = socket.handshake;

    if (!auth?.token) {
      socket.emit(SOCKET_GATEWAY_ERRORS.UNAUTHENTICATED);
      socket.disconnect(true);
      return;
    }

    try {
      const userData = await this.authService.verifyJWT(auth.token);
      const user = this.userService.getUser(userData.id);

      user.setSocket(socket);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        socket.emit(SOCKET_GATEWAY_ERRORS.INVALID_CREDENTIALS);
        socket.disconnect(true);
        return;
      }

      if (error instanceof JsonWebTokenError) {
        socket.emit(SOCKET_GATEWAY_ERRORS.UNAUTHORIZED);
        socket.disconnect(true);
        return;
      }

      socket.emit(SOCKET_GATEWAY_ERRORS.INTERNAL_SERVER_ERROR);
      socket.disconnect(true);
    }
  }

  public async handleDisconnect(socket: Socket) {
    if (socket.handshake.auth.token) {
      try {
        const { auth } = socket.handshake;
        const userData = await this.authService.verifyJWT(auth.token);
        const user = this.userService.getUser(userData.id);

        // This is dumb, I really should have just returned undefined and called it a day
        // But I'd need to refactor a few places to account for that
        // It stays as is
        // ... for now
        try {
          const room = this.roomService.getRoomByUser(user);
          room.removeUser(user);
        } catch {}

        this.userService.removeUser(userData.id);
      } catch {}
    }
  }

  @SubscribeMessage(IncomingRoomEvents.LIST_ROOMS)
  @UseGuards(SocketAuthGuard)
  public listRooms() {
    return this.roomService.listRooms();
  }

  @SubscribeMessage(IncomingRoomEvents.GET_ROOM)
  @UseGuards(SocketAuthGuard)
  @UseGuards(RoomUserGuard)
  public getRoom(@MessageBody() data: GetRoomDTO) {
    try {
      const room = this.roomService.getRoom(data.roomId);

      return room.getRoomDetails();
    } catch (error) {
      console.error(error);
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage(IncomingRoomEvents.CREATE_ROOM)
  @UseGuards(SocketAuthGuard)
  public createRoom(@ConnectedSocket() socket: AuthorizedSocket) {
    try {
      const user = this.userService.getUser(socket.user.id);
      const room = this.roomService.createRoom(user, this.server);
      const details = room.getBasicDetails();

      this.server.emit(OutgoingRoomEvents.ROOM_CREATED, details);
      // Generally I should switch to nestjs event emitter module
      // this will let me monitor all room events this way
      room.on(InternalRoomEvents.ROOM_CLOSED, () => {
        this.roomService.removeRoom(details.id);
        this.server.emit(OutgoingRoomEvents.ROOM_CLOSED, {
          roomId: details.id,
        });
      });

      return details;
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new WsUserNotFoundException();
      }

      if (error instanceof RoomNotFoundError) {
        throw new WsRoomNotFoundException();
      }

      throw new WsInternalServerErrorException();
    }
  }

  @SubscribeMessage(IncomingRoomEvents.JOIN_ROOM)
  @UseGuards(SocketAuthGuard)
  public joinRoom(
    @ConnectedSocket() socket: AuthorizedSocket,
    @MessageBody() data: JoinRoomDTO,
  ) {
    try {
      const user = this.userService.getUser(socket.user.id);
      const room = this.roomService.getRoom(data.roomId);

      room.addUser(user as Required<User>);

      return room.getRoomDetails();
    } catch (error) {
      console.error(error);
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage(IncomingRoomEvents.LEAVE_ROOM)
  @UseGuards(SocketAuthGuard)
  @UseGuards(RoomUserGuard)
  public leaveRoom(
    @ConnectedSocket() socket: AuthorizedSocket,
    @MessageBody() data: LeaveRoomDTO,
  ) {
    try {
      const user = this.userService.getUser(socket.user.id);
      const room = this.roomService.getRoom(data.roomId);

      room.removeUser(user as Required<User>);
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage(IncomingRoomEvents.GAME_EVENT)
  @UseGuards(SocketAuthGuard)
  @UseGuards(RoomUserGuard)
  public handleGameEvent(
    @ConnectedSocket() socket: AuthorizedSocket,
    @MessageBody() data: GameEventDTO,
  ): void {
    try {
      const user = this.userService.getUser(socket.user.id);
      const room = this.roomService.getRoom(data.roomId);

      // TODO: Should validate whether the user is in a room, because now you can send it to any room you wish
      // TODO: Probably best to validate that inside of a guard

      room.handleIncomingGameEvent(user, {
        event: data.event,
        data: {
          cards: data.cards,
        },
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new WsUserNotFoundException();
      }

      if (error instanceof RoomNotFoundError) {
        throw new WsRoomNotFoundException();
      }

      throw new WsInternalServerErrorException();
    }
  }

  @SubscribeMessage(IncomingRoomEvents.START_GAME)
  @UseGuards(SocketAuthGuard)
  @UseGuards(RoomOwnerGuard)
  public handleGameStart(
    @ConnectedSocket() socket: AuthorizedSocket,
    @MessageBody() data: StartGameDTO,
  ): void {
    try {
      // TODO: Validate if game is in progress inside of a guard
      const room = this.roomService.getRoom(data.roomId);

      room.startGame();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new WsUserNotFoundException();
      }

      if (error instanceof RoomNotFoundError) {
        throw new WsRoomNotFoundException();
      }

      throw new WsInternalServerErrorException();
    }
  }
}
